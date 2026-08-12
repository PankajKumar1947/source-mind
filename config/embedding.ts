import { MistralAIEmbeddings } from "@langchain/mistralai";
import { envConfig } from "./env";

export const generateEmbeddings = async (text: string, model?: string) => {
  const embeddings = new MistralAIEmbeddings({
    apiKey: envConfig.MISTRAL_API_KEY,
    model: model || "mistral-small-latest",
  });

  return embeddings.embedQuery(text);
}