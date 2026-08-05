"use server";

import { actionHandler } from "@/lib/action-handler";
import { ActionError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { CreateNotebookInput, createNotebookSchema } from "@/validations/notebook.validation";
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