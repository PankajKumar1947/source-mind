/*
  Warnings:

  - The primary key for the `notebook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "notebook" DROP CONSTRAINT "notebook_userId_fkey";

-- AlterTable
ALTER TABLE "notebook" DROP CONSTRAINT "notebook_pkey",
ALTER COLUMN "notebookId" DROP DEFAULT,
ALTER COLUMN "notebookId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "notebook_pkey" PRIMARY KEY ("notebookId");
DROP SEQUENCE "notebook_notebookId_seq";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "userId" DROP DEFAULT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("userId");
DROP SEQUENCE "user_userId_seq";

-- AddForeignKey
ALTER TABLE "notebook" ADD CONSTRAINT "notebook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
