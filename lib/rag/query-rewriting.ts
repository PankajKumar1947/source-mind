import { z } from 'zod';
import { mistral, MISTRAL_CHAT_MODEL } from '@/lib/clients/mistral';

const QUERY_REWRITING_SYSTEM_PROMPT = `
  You are a query understanding assistant for a retrieval system.
  Based on given user query, Produce following three variants of the user query.
  (1). step-back query: One broader background of the user query, which can be used to retrieve relevant documents for the original query.
  (2). rewritten query: Rewrite the original query with spelling/grammar fixed and made clear and self-contained. Preserve the original intent.
  (3). subqueries: Generate exactly 3 focused sub-questions the original query can be decomposed into.

  Your output should be an instance of a JSON object following this schema: {{ json_schema }}
`

export async function queryRewriting(query: string): Promise<QueryRewritingInput> {
  try {
    const chatResponse = await mistral.chat.parse({
      model: MISTRAL_CHAT_MODEL,
      messages: [
        { role: "system", content: QUERY_REWRITING_SYSTEM_PROMPT },
        { role: "user", content: query }

      ],
      responseFormat: queryRewritingSchema
    });

    const result = chatResponse.choices?.[0]?.message?.parsed;
    if (!result) {
      throw new Error("Failed to get response from Mistral");
    }
    const parsedResult = queryRewritingSchema.parse(result);
    if (!parsedResult) {
      throw new Error("Failed to parse response from Mistral");
    }

    return parsedResult;

  } catch (err) {
    console.log("Error rewriting query:", err);
    throw err;
  }
}

const queryRewritingSchema = z.object({
  stepBack: z.string().describe("A broader, higher-level 'step-back' question whose answer gives useful background for the original query.").nonempty(),
  rewritten: z.string().describe("The original query with spelling/grammar fixed and made clear and self-contained. Preserve the original intent.").nonempty(),
  subqueries: z.array(z.string().describe("Exactly 3 focused sub-questions the original query can be decomposed into.").nonempty()).length(3)
});

type QueryRewritingInput = z.infer<typeof queryRewritingSchema>;