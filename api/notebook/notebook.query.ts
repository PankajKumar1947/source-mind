export const notebookQueryKeys = {
  all: ["notebooks"] as const,
  list: () => [...notebookQueryKeys.all, "list"] as const,
  detail: (slug: string) => [...notebookQueryKeys.all, "detail", slug] as const,
};
