"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserNotebooks() {
  const { userId } = await auth();

  if (!userId) return [];

  return prisma.notebook.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNotebookById(notebookId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.notebook.findUnique({
    where: {
      notebookId: notebookId,
      userId: userId,
    },
    include: {
      sources: true,
      chats: true,
    },
  });
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function getNotebookBySlug(slug: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const notebooks = await prisma.notebook.findMany({
    where: {
      userId: userId,
    },
    include: {
      sources: true,
      chats: true,
    },
  });

  return notebooks.find(n => slugify(n.title) === slug) || null;
}