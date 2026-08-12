import { SOURCE_QUEUE_NAME, SourceJobData } from "@/services/queue.service";
import prisma from "@/lib/prisma";
import { Worker } from "bullmq";
import { connection } from "@/config/queue";
import { SourceStatus } from "@/prisma/generated/prisma";
import loadPdfPages from "@/lib/pdf-parser";
import { addDocuments } from "@/lib/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const sourceWorker = new Worker<SourceJobData>(SOURCE_QUEUE_NAME, async (job) => {
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

sourceWorker.on("active", async (job) => {
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

sourceWorker.on("completed", async (job) => {
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

sourceWorker.on("failed", async (job, error) => {
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

// Graceful shutdown to close worker connections when server process stops
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down worker gracefully...`);
  await sourceWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));