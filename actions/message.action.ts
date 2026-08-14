import { envConfig } from "@/config/env";
import { actionHandler } from "@/lib/action-handler";
import { ActionError } from "@/lib/errors";
import { mistral, MISTRAL_CHAT_MODEL } from "@/lib/mistral";
import prisma from "@/lib/prisma";
import { similaritySearch } from "@/lib/qdrant";
import { hydeDocuments } from "@/lib/query/hyde";
import { queryRewriting } from "@/lib/query/query-rewriting";
import { MessageRole, MessageStatus } from "@/prisma/generated/prisma";
import { CreateMessageInput, createMessageSchema } from "@/validations/message.validation";
import { auth } from "@clerk/nextjs/server";

export const createMessage = actionHandler(
  async ({ chatId, content, notebookId }: CreateMessageInput) => {
    const { userId } = await auth();

    if (!userId) throw new ActionError("Unauthorized");

    let newChatId = chatId;
    if (chatId === "new") {
      const chat = await prisma.chat.create({
        data: {
          title: content.substring(0, 15),
          notebook: {
            connect: {
              notebookId
            }
          }
        }
      })
      newChatId = chat.chatId;
    };

    await prisma.message.create({
      data: {
        content,
        chatId: newChatId,
        role: MessageRole.USER,
        status: "COMPLETED"
      }
    });

    const [{ stepBack, rewritten, subqueries }, hyde] = await Promise.all([
      queryRewriting(content),
      hydeDocuments(content)
    ]);

    const retrieves = await similaritySearch(stepBack + "\n" + rewritten + "\n" + subqueries.join(", "), envConfig.MISTRAL_EMBEDDING_MODEL)

    const chatResponse = await mistral.chat.complete({
      model: MISTRAL_CHAT_MODEL,
      messages: [{
        role: 'system',
        content: `You are an AI assistant.
        Use the following retrieved knowledge snippets to answer the user's query.
        If the retrieved information is not sufficient, reply "I don't have enough information to answer this question."

        Retrieved Knowledge:
        ${retrieves.map(r => r.pageContent).join("\n")}`,
      },
      {
        role: 'user',
        content
      }]
    })

    const aiMessage = chatResponse.choices[0]?.message?.content as string;
    if (!aiMessage) throw new ActionError("Failed to generate response");
    console.log("aiMessage", aiMessage);

    await prisma.message.create({
      data: {
        content: aiMessage,
        chatId: newChatId,
        role: MessageRole.ASSISTANT,
        status: MessageStatus.COMPLETED
      }
    })

    return {
      success: true,
      message: aiMessage || "AI failed to generate response",
    }
  },
  createMessageSchema
)
