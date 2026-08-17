import { embeddings } from "@/lib/clients/embeddings";
import { envConfig } from "@/config/env";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";

const client = new QdrantClient({
  host: envConfig.QDRANT_HOST,
  port: envConfig.QDRANT_PORT,
});

const collectionName = 'textbook-sourcemind';

export const vectorStore = (model: string) => new QdrantVectorStore(embeddings(model), {
  client,
  collectionName,
});


// Store documents into Qdrant using the specified embedding model.
export async function addDocuments(docs: Document[], embeddingModel: string) {
  const store = vectorStore(embeddingModel);
  await store.addDocuments(docs);
}


// Delete all points/vectors from Qdrant matching a specific sourceId.
export async function deleteDocumentsBySourceId(sourceId: string) {
  await client.delete(collectionName, {
    filter: {
      must: [
        {
          key: "metadata.sourceId",
          match: {
            value: sourceId,
          },
        },
      ],
    },
  });
}


// Perform a similarity search on Qdrant.
export async function similaritySearch(
  query: string,
  embeddingModel: string,
  k = 4,
  filter?: any
) {
  const store = vectorStore(embeddingModel);
  return store.similaritySearch(query, k, filter);
}

