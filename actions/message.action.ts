"use server";

import { actionHandler } from "@/lib/action-handler";
import { ActionError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { enqueueQueryJob } from "@/lib/queue";
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
        status: MessageStatus.COMPLETED
      }
    });

    const assistantMessage = await prisma.message.create({
      data: {
        content: "",
        chatId: newChatId,
        role: MessageRole.ASSISTANT,
        status: MessageStatus.PROCESSING
      }
    });

    await enqueueQueryJob({
      chatId: newChatId,
      content,
      notebookId,
      assistantMessageId: assistantMessage.messageId
    })

    return {
      success: true,
      message: "Query job enqueued",
      chatId: newChatId,
    }
  },
  createMessageSchema
)
