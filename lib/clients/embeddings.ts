import { MistralAIEmbeddings } from "@langchain/mistralai";
import { envConfig } from "@/config/env";

const apiKey = envConfig.MISTRAL_API_KEY;

export const embeddings = (model?: string) => new MistralAIEmbeddings({
  apiKey,
  model: model || envConfig.MISTRAL_EMBEDDING_MODEL,
})