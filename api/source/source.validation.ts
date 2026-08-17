import { SourceType } from "@/prisma/generated/prisma";
import z from "zod";

export const addSourceInputSchema = z.object({
  notebookId: z.string().nonempty("Notebook ID is required"),
  title: z.string().nonempty("Title is required"),
  sourceType: z.enum(SourceType),
  storageKey: z.string().optional(),
  url: z.string().optional(),
  content: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.sourceType === "PDF") {
    if (!data.storageKey || data.storageKey.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "Storage key is required for PDF sources",
        path: ["storageKey"],
      });
    }
  } else if (data.sourceType === "WEB_LINK") {
    if (!data.url || data.url.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "URL is required for web link sources",
        path: ["url"],
      });
    }
  } else if (data.sourceType === "TEXT") {
    if (
      (!data.storageKey || data.storageKey.trim() === "") &&
      (!data.content || data.content.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Either storage key or text content is required for text sources",
        path: ["content"],
      });
    }
  }
});

export type AddSourceInput = z.infer<typeof addSourceInputSchema>;
