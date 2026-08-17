import { NextRequest, NextResponse, after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { enqueueQueryJob } from "@/lib/queue";
import { mistral, MISTRAL_CHAT_MODEL } from "@/lib/mistral";
import { HYDE_SYSTEM_PROMPT } from "@/lib/query/hyde";
import { MessageRole, MessageStatus } from "@/prisma/generated/prisma";

export async function POST(req: NextRequest) {
  try {

    const { chatId, content, notebookId } = await req.json();
    if (!content || !notebookId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let newChatId = chatId;
    if (chatId === "new") {
      const chat = await prisma.chat.create({
        data: {
          title: content.substring(0, 15),
          notebook: {
            connect: {
              notebookId,
            },
          },
        },
      });
      newChatId = chat.chatId;
    }

    // 1. Create User Message
    await prisma.message.create({
      data: {
        content,
        chatId: newChatId,
        role: MessageRole.USER,
        status: MessageStatus.COMPLETED,
      },
    });

    // 2. Create Assistant Placeholder Message
    const assistantMessage = await prisma.message.create({
      data: {
        content: "",
        chatId: newChatId,
        role: MessageRole.ASSISTANT,
        status: MessageStatus.PROCESSING,
      },
    });

    // Enqueue the query job immediately in the background so it runs in parallel with the HyDE stream
    after(
      (async () => {
        try {
          await enqueueQueryJob({
            chatId: newChatId,
            content,
            notebookId,
            assistantMessageId: assistantMessage.messageId,
          });
        } catch (bgError) {
          console.error("Error in background chat queue execution:", bgError);
        }
      })()
    );

    const encoder = new TextEncoder();

    // 3. Create readable stream for HyDE generation
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await mistral.chat.stream({
            model: MISTRAL_CHAT_MODEL,
            messages: [
              { role: "system", content: HYDE_SYSTEM_PROMPT },
              { role: "user", content },
            ],
          });

          let hydeText = "";
          for await (const chunk of responseStream) {
            const content = chunk.data.choices[0]?.delta?.content;
            const token = typeof content === "string" ? content : "";
            if (token) {
              hydeText += token;
              controller.enqueue(encoder.encode(token));
            }
          }

          controller.close();

          // Save HyDE response draft preview ONLY if the background worker hasn't already completed the message
          after(
            (async () => {
              try {
                await prisma.message.updateMany({
                  where: {
                    messageId: assistantMessage.messageId,
                    status: MessageStatus.PROCESSING,
                  },
                  data: {
                    content: hydeText,
                  },
                });
              } catch (bgError) {
                console.error("Error saving hyde text preview:", bgError);
              }
            })()
          );
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "x-chat-id": newChatId,
      },
    });
  } catch (error) {
    console.error("Error starting chat stream:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
