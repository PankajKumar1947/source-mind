import "dotenv/config";
import prisma from "@/lib/clients/prisma";
import { Worker } from "bullmq";
import { connection, SourceJobData } from "@/lib/clients/queue";
import { SourceStatus, SourceType } from "@/prisma/generated/prisma";
import loadPdfPages from "@/lib/helpers/pdf-parser";
import { addDocuments } from "@/lib/rag/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { INDEXING_QUEUE } from "@/config/env";
import { scrapWebLink } from "@/lib/clients/firecrawl";
import { Document } from "@langchain/core/documents";
import { getYoutubeTranscript, extractYoutubeVideoId } from "@/lib/helpers/youtube-transcript";

export const indexingSourceWorker = new Worker<SourceJobData>(INDEXING_QUEUE, async (job) => {
  console.log("Job received", job.name, job.data);

  // 1. Fetch the source details from the database
  const source = await prisma.source.findUnique({
    where: { sourceId: job.data.sourceId },
  });

  if (!source) {
    throw new Error(`Source not found for ID: ${job.data.sourceId}`);
  }

  let docs: Document[] = [];
  if (source.sourceType === SourceType.WEB_LINK) {
    if (!source.url) {
      throw new Error(`URL is missing for web link source ID: ${job.data.sourceId}`);
    }
    const scrapedData = await scrapWebLink(source.url, "markdown");
    const content = scrapedData.markdown || JSON.stringify(scrapedData);
    docs = [
      new Document({
        pageContent: content,
        metadata: {
          source: source.url,
          title: source.title,
        },
      }),
    ];
  } else if (source.sourceType === SourceType.TEXT) {
    if (!source.content) {
      throw new Error(`Content is missing for text source ID: ${job.data.sourceId}`);
    }
    const textContent = source.content;
    docs = [
      new Document({
        pageContent: textContent,
        metadata: {
          source: source.url || "direct-input",
          title: source.title || "Custom Text",
        },
      }),
    ];
  } else if (source.sourceType === SourceType.YT_VIDEO) {
    if (!source.url) {
      throw new Error(`URL is missing for YouTube video source ID: ${job.data.sourceId}`);
    }
    const videoId = extractYoutubeVideoId(source.url);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL for source ID: ${job.data.sourceId}`);
    }
    const transcriptParts = await getYoutubeTranscript(videoId);
    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error(`Failed to fetch transcript or transcript is empty for Video ID: ${videoId}`);
    }
    const fullTranscript = transcriptParts.map((t) => t.text).join(" ");
    docs = [
      new Document({
        pageContent: fullTranscript,
        metadata: {
          source: source.url,
          title: source.title || "YouTube Video",
        },
      }),
    ];
  } else {
    // 2. Parse the PDF document
    if (!source.storageKey) {
      throw new Error(`Storage key is missing for PDF source ID: ${job.data.sourceId}`);
    }
    docs = await loadPdfPages(source.storageKey);
  }

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