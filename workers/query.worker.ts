import { Worker } from "bullmq";
import { connection, QueryJobData } from "@/lib/clients/queue";
import { envConfig, QUERY_QUEUE } from "@/config/env";
import { queryRewriting } from "@/lib/rag/query-rewriting";
import { mistral, MISTRAL_CHAT_MODEL } from "@/lib/clients/mistral";
import { similaritySearch } from "@/lib/rag/qdrant";
import prisma from "@/lib/clients/prisma";
import { ActionError } from "@/lib/helpers/errors";
import { MessageStatus } from "@/prisma/generated/prisma";
import { Document } from "@langchain/core/documents";
import { z } from "zod";

const queryResponseSchema = z.object({
  answer: z.string(),
  usedSourceIndexes: z.array(z.number()),
});

function reciprocalRankFusion(results: Document[][], k = 60): Document[] {
  const rrfScores: { [key: string]: { doc: Document; score: number } } = {};

  results.forEach((list) => {
    list.forEach((doc, rank) => {
      const key = doc.pageContent;
      const r = rank + 1;

      if (!rrfScores[key]) {
        rrfScores[key] = { doc, score: 0 };
      }
      rrfScores[key].score += 1 / (k + r);
    });
  });

  return Object.values(rrfScores)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.doc);
}

export const queryWorker = new Worker<QueryJobData>(QUERY_QUEUE, async (job) => {
  console.log("Query job received", job.name, job.data);
  const { chatId, content, notebookId, assistantMessageId } = job.data;

  try {
    const source = await prisma.source.findFirst({
      where: { notebookId }
    });
    const embeddingModel = source?.embeddingModel || envConfig.MISTRAL_EMBEDDING_MODEL;

    // Run rewriting steps in the worker
    const { stepBack, rewritten, subqueries } = await queryRewriting(content);

    const filter = {
      must: [
        {
          key: "metadata.notebookId",
          match: {
            value: notebookId,
          },
        },
      ],
    };

    const stepBackResult = await similaritySearch(stepBack, embeddingModel, 4, filter);
    const rewrittenResult = await similaritySearch(rewritten, embeddingModel, 4, filter);
    const subqueriesResult = await similaritySearch(subqueries.join(", "), embeddingModel, 4, filter);

    // Merge results using Reciprocal Rank Fusion (RRF)
    const mergedResults = reciprocalRankFusion([
      stepBackResult,
      rewrittenResult,
      subqueriesResult
    ]);

    // Take top 5 consolidated context snippets
    const finalContext = mergedResults.slice(0, 5);

    const chatResponse = await mistral.chat.parse({
      model: MISTRAL_CHAT_MODEL,
      responseFormat: queryResponseSchema,
      messages: [{
        role: 'system',
        content: `You are an AI assistant.
          Use the following retrieved knowledge snippets to answer the user's query.
          If the retrieved information is not sufficient, reply "I don't have enough information to answer this question."

          CRITICAL RULES FOR "usedSourceIndexes":
          - Be extremely strict. ONLY include a source index if you directly cited or extracted specific facts/text from it to construct your answer.
          - If a source was irrelevant, not used, or did not contribute to the response, DO NOT include its index.
          - List at most 4 source indexes. If more than 4 sources were useful, only list the top 4 most critical ones.
          - If the retrieved knowledge is not sufficient to answer, reply "I don't have enough information to answer this question." and set "usedSourceIndexes" to an empty array [].

          Retrieved Knowledge Snippets:
          ${finalContext.map((r, idx) => `[Source ${idx + 1}]:\n${r.pageContent}`).join("\n\n")}
          `,
      },
      {
        role: 'user',
        content
      }]
    });

    const result = chatResponse.choices?.[0]?.message?.parsed;
    if (!result) {
      throw new ActionError("Failed to parse response from Mistral");
    }

    const parsedResult = queryResponseSchema.parse(result);
    const aiMessage = parsedResult.answer || "I don't have enough information to answer this question.";
    
    const usedSourceIndexes = (parsedResult.usedSourceIndexes || []).slice(0, 4);

    await prisma.message.update({
      where: { messageId: assistantMessageId },
      data: {
        content: aiMessage,
        status: MessageStatus.COMPLETED
      }
    });

    const validCitations = finalContext
      .filter((doc, idx) => !!doc.metadata.sourceId && usedSourceIndexes.includes(idx + 1))
      .map((doc) => {
        const page = doc.metadata.page;
        return {
          messageId: assistantMessageId,
          sourceId: doc.metadata.sourceId as string,
          pageNumber: page !== undefined && page !== null ? Number(page) + 1 : null,
          content: doc.pageContent,
        };
      });

    if (validCitations.length > 0) {
      await prisma.citation.createMany({
        data: validCitations,
      });
    }
  } catch (error) {
    console.error("Query worker execution failed", error);
    await prisma.message.update({
      where: { messageId: assistantMessageId },
      data: {
        content: "Failed to generate response. Please try again.",
        status: MessageStatus.FAILED
      }
    });
    throw error;
  }
}, { connection });

queryWorker.on("active", async (job) => {
  await prisma.message.update({
    where: { messageId: job.data.assistantMessageId },
    data: {
      status: MessageStatus.PROCESSING
    }
  });
});

queryWorker.on("completed", async (job) => {
  console.log("Query job completed", job.name, job.data);
  await prisma.message.update({
    where: { messageId: job.data.assistantMessageId },
    data: {
      status: MessageStatus.COMPLETED
    }
  });
});

queryWorker.on("failed", async (job, error) => {
  console.error("Query job failed", job?.id, job?.name, job?.data, error);
  if (!job) return;
  try {
    await prisma.message.update({
      where: { messageId: job.data.assistantMessageId },
      data: {
        status: MessageStatus.FAILED
      }
    });
  } catch (error) {
    console.error("Failed to update message status to FAILED for job", job.id, job.name, error);
  }
});
