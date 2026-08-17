import { Worker } from "bullmq";
import { connection, QueryJobData } from "@/lib/queue";
import { envConfig, QUERY_QUEUE } from "@/config/env";
import { queryRewriting } from "@/lib/query/query-rewriting";
import { mistral, MISTRAL_CHAT_MODEL } from "@/lib/mistral";
import { similaritySearch } from "@/lib/qdrant";
import prisma from "@/lib/prisma";
import { ActionError } from "@/lib/errors";
import { MessageStatus } from "@/prisma/generated/prisma";
import { Document } from "@langchain/core/documents";

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

    const chatResponse = await mistral.chat.complete({
      model: MISTRAL_CHAT_MODEL,
      messages: [{
        role: 'system',
        content: `You are an AI assistant.
          Use the following retrieved knowledge snippets to answer the user's query.
          If the retrieved information is not sufficient, reply "I don't have enough information to answer this question."

          Retrieved Knowledge:
          ${finalContext.map(r => r.pageContent).join("\n\n")}
          `,
      },
      {
        role: 'user',
        content
      }]
    })

    const aiMessage = chatResponse.choices[0]?.message?.content as string;
    if (!aiMessage) throw new ActionError("Failed to generate response");
    console.log("aiMessage", aiMessage);

    await prisma.message.update({
      where: { messageId: assistantMessageId },
      data: {
        content: aiMessage,
        status: MessageStatus.COMPLETED
      }
    });
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
