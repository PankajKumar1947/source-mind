export const sourceQueryKeys = {
  all: ["sources"] as const,
  list: (notebookId: string) => [...sourceQueryKeys.all, "list", notebookId] as const,
};
