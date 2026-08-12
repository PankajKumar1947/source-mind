import { Queue } from 'bullmq';
import { envConfig, INDEXING_QUEUE, QUERY_QUEUE } from '../config/env';
import IORedis from 'ioredis';

export const connection = new IORedis({
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export type SourceJobData = {
  sourceId: string;
};

export const indexingQueue = new Queue<SourceJobData>(INDEXING_QUEUE, { connection });
export const queryQueue = new Queue(QUERY_QUEUE, { connection });

export async function enqueueSourceJob(payload: SourceJobData) {
  return await indexingQueue.add("index-source",
    payload,
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
      jobId: payload.sourceId,
    }
  )
}
