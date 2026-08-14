import z from "zod";

export const createMessageSchema = z.object({
  notebookId: z.string().optional(),
  chatId: z.string().nonempty("Chat id is required"),
  content: z.string().nonempty("Message is required"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;