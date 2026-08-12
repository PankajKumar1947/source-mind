import { SOURCE_QUEUE_NAME, SourceJobData } from "@/services/queue.service";
import prisma from "@/lib/prisma";
import { Worker } from "bullmq";
import { connection } from "@/config/queue";
import { SourceStatus } from "@/prisma/generated/prisma";

const sourceWorker = new Worker<SourceJobData>(SOURCE_QUEUE_NAME, async (job) => {
  console.log("Job received", job.name, job.data);
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