"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/clients/prisma";

export async function getChatsByNotebookId(notebookId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.chat.findMany({
    where: {
      notebookId: notebookId,
      notebook: {
        userId: userId,
      },
    },
    include: {
      messages: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChatById(chatId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const chat = await prisma.chat.findUnique({
    where: {
      chatId: chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          citations: {
            include: {
              source: true,
            },
          },
        },
      },
      notebook: true,
    },
  });

  if (!chat || chat.notebook.userId !== userId) return null;

  return chat;
}