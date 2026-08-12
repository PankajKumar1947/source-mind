import { envConfig } from './env';
import IORedis from 'ioredis';

export const connection = new IORedis({
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  maxRetriesPerRequest: null,
});