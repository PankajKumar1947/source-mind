import { Mistral } from '@mistralai/mistralai';
import { envConfig } from "@/config/env";

const apiKey = envConfig.MISTRAL_API_KEY;
export const mistral = new Mistral({ apiKey: apiKey });

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
}
export const MISTRAL_CHAT_MODEL = "mistral-medium-latest";