export const queryKeys = {
  notebooks: {
    all: ["notebooks"] as const,
    list: () => [...queryKeys.notebooks.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.notebooks.all, "detail", slug] as const,
  },
  chats: {
    all: ["chats"] as const,
    list: (notebookId: string) => [...queryKeys.chats.all, "list", notebookId] as const,
    detail: (chatId: string) => [...queryKeys.chats.all, "detail", chatId] as const,
  },
} as const;
