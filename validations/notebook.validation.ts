import z from "zod";

export const createNotebookSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
});

export const updateNotebookSchema = createNotebookSchema.partial();

export type CreateNotebookSchema = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookSchema = z.infer<typeof updateNotebookSchema>;