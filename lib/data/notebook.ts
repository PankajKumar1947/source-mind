"use server";

import prisma from "@/lib/clients/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/prisma/generated/prisma";
import { SearchSortOptions } from "@/api/shared/common.type";

export async function getUserNotebooks(options?: SearchSortOptions) {
  const { userId } = await auth();

  if (!userId) return [];

  const where: Prisma.NotebookWhereInput = { userId };
  if (options?.query) {
    where.title = {
      contains: options.query,
      mode: "insensitive",
    };
  }

  let orderBy: Prisma.NotebookOrderByWithRelationInput = { createdAt: "desc" };
  if (options?.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (options?.sort === "az") {
    orderBy = { title: "asc" };
  } else if (options?.sort === "za") {
    orderBy = { title: "desc" };
  }

  return prisma.notebook.findMany({
    where,
    orderBy,
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