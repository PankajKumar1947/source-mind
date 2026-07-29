/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('ASSISTANT', 'USER', 'SYSTEM', 'TOOL');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PDF', 'TEXT', 'WEB_LINK', 'YT_VIDEO', 'VTT');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'PROCESSING');

-- DropIndex
DROP INDEX "user_email_idx";

-- CreateTable
CREATE TABLE "chat" (
    "chatId" TEXT NOT NULL,
    "notebookId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "message" (
    "messageId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "citation" (
    "citationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citation_pkey" PRIMARY KEY ("citationId")
);

-- CreateTable
CREATE TABLE "source" (
    "sourceId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "title" TEXT,
    "storageKey" TEXT,
    "url" TEXT,
    "embeddingModel" TEXT NOT NULL,
    "status" "SourceStatus" NOT NULL,
    "notebookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_pkey" PRIMARY KEY ("sourceId")
);

-- CreateTable
CREATE TABLE "chunk" (
    "chunkId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chunk_pkey" PRIMARY KEY ("chunkId")
);

-- CreateIndex
CREATE INDEX "chat_notebookId_idx" ON "chat"("notebookId");

-- CreateIndex
CREATE INDEX "message_chatId_createdAt_idx" ON "message"("chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "citation_messageId_idx" ON "citation"("messageId");

-- CreateIndex
CREATE INDEX "citation_chunkId_idx" ON "citation"("chunkId");

-- CreateIndex
CREATE INDEX "source_notebookId_idx" ON "source"("notebookId");

-- CreateIndex
CREATE INDEX "chunk_sourceId_idx" ON "chunk"("sourceId");

-- CreateIndex
CREATE INDEX "chunk_sourceId_chunkIndex_idx" ON "chunk"("sourceId", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebook"("notebookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citation" ADD CONSTRAINT "citation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("messageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citation" ADD CONSTRAINT "citation_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "chunk"("chunkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebook"("notebookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunk" ADD CONSTRAINT "chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("sourceId") ON DELETE CASCADE ON UPDATE CASCADE;
