import { SourceType } from "@/prisma/generated/prisma";
import z from "zod";

export const addSourceInputSchema = z.object({
  notebookId: z.string().nonempty("Notebook ID is required"),
  title: z.string().nonempty("Title is required"),
  sourceType: z.enum(SourceType),
  storageKey: z.string().nonempty("Storage key is required"),
  url: z.string().optional(),
});

export type AddSourceInput = z.infer<typeof addSourceInputSchema>;
