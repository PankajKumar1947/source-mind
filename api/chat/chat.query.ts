export const chatQueryKeys = {
  all: ["chats"] as const,
  list: (notebookId: string) => [...chatQueryKeys.all, "list", notebookId] as const,
  detail: (chatId: string) => [...chatQueryKeys.all, "detail", chatId] as const,
};
