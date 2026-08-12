import { MistralAIEmbeddings } from "@langchain/mistralai";
import { envConfig } from "./env";

export const embeddings = (model?: string) => new MistralAIEmbeddings({
  apiKey: envConfig.MISTRAL_API_KEY,
  model: model || envConfig.MISTRAL_EMBEDDING_MODEL,
})