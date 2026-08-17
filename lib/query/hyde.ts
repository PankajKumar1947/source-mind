import { mistral, MISTRAL_CHAT_MODEL } from "../mistral";

export const HYDE_SYSTEM_PROMPT = `
  You are an expert in generating hypothetical documents for vector search retrieval (RAG).
  Given a user query, generate a hypothetical passage or document chunk that would contain the answer.
  
  CRITICAL RULES:
  1. Do not invent specific facts, list items, or national structures (like US government departments) out of thin air if the query asks for information from "given documents" or "provided context". 
  2. Instead, generate a template passage describing how the document structures the answer (e.g., "The document details various government job exams, positions, vacancies, and pay scales, listing roles like...").
  3. Keep the content abstract but matching the search intent.
  4. Do not mention that this is a hypothetical answer or that you are unsure.
`;

export async function hydeDocuments(query: string): Promise<string> {
  try {
    const response = await mistral.chat.complete({
      model: MISTRAL_CHAT_MODEL,
      messages: [
        { role: "system", content: HYDE_SYSTEM_PROMPT },
        { role: "user", content: query }
      ]
    });

    const result = response.choices[0]?.message?.content as string;
    if (!result) {
      throw new Error("Failed to generate hyde response.");
    }
    return result || "";

  } catch (error) {
    console.log("Error in hydeDocuments:", error);
    throw error;
  }
}