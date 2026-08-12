import { Queue } from "bullmq";
import { connection } from "@/config/queue";

export const SOURCE_QUEUE_NAME = "source_queue";
export const SOURCE_JOB_NAME = "source_job";

export type SourceJobData = {
  sourceId: string;
}

export const sourceQueue = new Queue<SourceJobData>(SOURCE_QUEUE_NAME, {
  connection,
});

export async function addSourceJob(sourceId: string) {
  return sourceQueue.add(
    SOURCE_JOB_NAME,
    { sourceId },
    { jobId: sourceId }
  );
}
