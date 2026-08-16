import "dotenv/config";
import prisma from "@/lib/prisma";
import { Worker } from "bullmq";
import { connection, SourceJobData } from "@/lib/queue";
import { SourceStatus } from "@/prisma/generated/prisma";
import loadPdfPages from "@/lib/pdf-parser";
import { addDocuments } from "@/lib/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { INDEXING_QUEUE } from "@/config/env";

export const indexingSourceWorker = new Worker<SourceJobData>(INDEXING_QUEUE, async (job) => {
  console.log("Job received", job.name, job.data);

  // 1. Fetch the source details from the database
  const source = await prisma.source.findUnique({
    where: { sourceId: job.data.sourceId },
  });

  if (!source || !source.storageKey) {
    throw new Error(`Source not found or missing storage key for ID: ${job.data.sourceId}`);
  }

  // 2. Parse the PDF document
  const docs = await loadPdfPages(source.url || '');

  // Enrich document metadata with database identifiers
  const enrichedDocs = docs.map((doc) => {
    doc.metadata = {
      ...doc.metadata,
      sourceId: source.sourceId,
      notebookId: source.notebookId,
    };
    return doc;
  });

  // Split documents into optimal chunks for embedding (e.g. max 1000 characters)
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await textSplitter.splitDocuments(enrichedDocs);

  // 3. Generate embeddings and store in Qdrant vector DB
  await addDocuments(splitDocs, source.embeddingModel);
  console.log(`Successfully stored ${splitDocs.length} chunks in vector store.`);

  job.updateProgress(100);
}, {
  connection
});

indexingSourceWorker.on("active", async (job) => {
  console.log(`Job ${job.id} [${job.name}] is now active.`);
  try {
    await prisma.source.update({
      where: {
        sourceId: job.data.sourceId,
      },
      data: {
        status: SourceStatus.PROCESSING,
      },
    });
  } catch (error) {
    console.error(`Failed to update status to PROCESSING for job ${job.id}:`, error);
  }
});

indexingSourceWorker.on("completed", async (job) => {
  console.log(`Job ${job.id} [${job.name}] has completed.`);
  try {
    await prisma.source.update({
      where: {
        sourceId: job.data.sourceId,
      },
      data: {
        status: SourceStatus.SUCCESS,
      },
    });
  } catch (error) {
    console.error(`Failed to update status to SUCCESS for job ${job.id}:`, error);
  }
});

indexingSourceWorker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id} has failed:`, error);
  if (!job) return;
  try {
    await prisma.source.update({
      where: {
        sourceId: job.data.sourceId,
      },
      data: {
        status: SourceStatus.FAILED,
      },
    });
  } catch (err) {
    console.error(`Failed to update status to FAILED for job ${job.id}:`, err);
  }
});