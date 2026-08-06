import z from "zod";

export const createNotebookSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
});

export const updateNotebookSchema = z.object({
  notebookId: z.uuid(),
  title: z.string().min(1, "Title cannot be empty"),
});

export const deleteNotebookSchema = z.object({
  notebookId: z.uuid(),
});

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;
export type DeleteNotebookInput = z.infer<typeof deleteNotebookSchema>;