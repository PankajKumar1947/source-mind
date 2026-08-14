import { mistral, MISTRAL_CHAT_MODEL } from "../mistral";

const HYDE_SYSTEM_PROMPT = `
  You are an expert in generating hypothetical answers or documents.
  Generate a comprehensive, well-structured hypothetical answer based on the following query. 
  The answer should be detailed, factual in tone (even if the topic is speculative), and cover the key aspects implied by the query.
  Do not reference that this is a hypothetical answer and also don't tell You are Unsure in the response.  
`

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