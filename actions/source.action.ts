"use server";

import { actionHandler } from "@/lib/action-handler";
import { ActionError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AddSourceInput, addSourceInputSchema } from "@/validations/source.validation";
import { SourceStatus } from "@/prisma/generated/prisma";
import { addSourceJob } from "@/services/queue.service";

export const addSource = actionHandler(
  async (source: AddSourceInput) => {
    const { userId } = await auth();

    if (!userId) throw new ActionError("Unauthorized");

    const noteBookExists = await prisma.notebook.findUnique({
      where: {
        notebookId: source.notebookId,
        userId: userId,
      }
    })
    if (!noteBookExists) throw new ActionError("Notebook not found");

    const res = await prisma.source.create({
      data: {
        notebookId: source.notebookId,
        title: source.title,
        sourceType: source.sourceType,
        storageKey: source.storageKey,
        status: SourceStatus.PENDING,
        embeddingModel: "text-embedding-3-small",
      }
    });

    // add in the queue
    await addSourceJob(res.sourceId);

    return {
      success: true,
      message: "Source added successfully",
    }
  },
  addSourceInputSchema
)