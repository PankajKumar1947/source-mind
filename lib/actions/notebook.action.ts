"use server";

import { actionHandler } from "@/lib/helpers/action-handler";
import { ActionError } from "@/lib/helpers/errors";
import { deleteImageKitFolder } from "@/lib/helpers/imagekit";
import prisma from "@/lib/clients/prisma";
import { CreateNotebookInput, createNotebookSchema, DeleteNotebookInput, deleteNotebookSchema, UpdateNotebookInput, updateNotebookSchema } from "@/api/notebook/notebook.validation";
import { auth } from '@clerk/nextjs/server'
import { SourceType } from "@/prisma/generated/prisma";

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

    // Fetch notebook details to build the ImageKit folder path
    const notebook = await prisma.notebook.findUnique({
      where: {
        notebookId: notebookId,
        userId: userId,
      },
      select: {
        title: true,
        userId: true,
      },
    });

    if (!notebook) throw new ActionError("Notebook not found");

    const folderPath = `/source-mind/${notebook.userId}/${notebook.title.replace(/[^a-zA-Z0-9-_]/g, "-")}`;

    await prisma.notebook.delete({
      where: {
        notebookId: notebookId,
        userId: userId,
      },
    });

    // Delete the entire ImageKit folder (and all its files) asynchronously
    await deleteImageKitFolder(folderPath);

    return {
      success: true,
      message: "Notebook deleted successfully",
    };
  },
  deleteNotebookSchema
);
