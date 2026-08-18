import prisma from "@/lib/clients/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getSourceById(sourceId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const source = await prisma.source.findUnique({
    where: {
      sourceId: sourceId,
    },
    include: {
      notebook: true,
    },
  });

  if (!source || source.notebook.userId !== userId) {
    return null;
  }

  return source;
}
