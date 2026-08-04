import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { createNotebookSchema } from "@/validations/notebook.validation";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req) => {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Unauthorized");

  const { title } = req.parsedBody;

  const notebook = await prisma.notebook.create({
    data: {
      title,
      user: {
        connect: {
          userId: user.id
        }
      }
    }
  });

  return NextResponse.json({ notebook });
}, createNotebookSchema);