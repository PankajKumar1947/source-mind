"use server";

import { actionHandler } from "@/lib/action-handler";
import { ActionError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { CreateNotebookInput, createNotebookSchema, DeleteNotebookInput, deleteNotebookSchema, UpdateNotebookInput, updateNotebookSchema } from "@/validations/notebook.validation";
import { auth } from '@clerk/nextjs/server'

export const createNotebook = actionHandler(
  async (notebook: CreateNotebookInput) => {
    const { userId } = await auth();

    if (!userId) throw new ActionError("Unauthorized");

    await prisma.notebook.create({
      data: {
        title: notebook.title,
        userId
      }
    })

    return {
      success: true,
      message: "Notebook created successfully",
    };
  },
  createNotebookSchema
);

export const updateNotebook = actionHandler(
  async (notebook: UpdateNotebookInput) => {
    const { userId } = await auth();

    if (!userId) throw new ActionError("Unauthorized");

    await prisma.notebook.update({
      where: {
        notebookId: notebook.notebookId,
        userId: userId,
      },
      data: {
        title: notebook.title,
      },
    });

    return {
      success: true,
      message: "Notebook updated successfully",
    };
  },
  updateNotebookSchema
);

export const deleteNotebook = actionHandler(
  async ({ notebookId }: DeleteNotebookInput) => {
    const { userId } = await auth();

    if (!userId) throw new ActionError("Unauthorized");

    await prisma.notebook.delete({
      where: {
        notebookId: notebookId,
        userId: userId,
      },
    });

    return {
      success: true,
      message: "Notebook deleted successfully",
    };
  },
  deleteNotebookSchema
);
