import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  DATABASE_URL: z.url({ message: "DATABASE_URL is required and must be a valid URL" }),
  REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }),
  REDIS_PORT: z.coerce.number().min(1, { message: "REDIS_PORT is required" }),
  MISTRAL_API_KEY: z.string().min(1, { message: "MISTRAL_API_KEY is required" }),
  QDRANT_HOST: z.string().min(1, { message: "QDRANT_HOST is required" }),
  QDRANT_PORT: z.coerce.number().min(1, { message: "QDRANT_PORT is required" }),
});

export const envConfig = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  QDRANT_HOST: process.env.QDRANT_HOST,
  QDRANT_PORT: process.env.QDRANT_PORT,
});
