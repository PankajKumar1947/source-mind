export type SortOption = "newest" | "oldest" | "az" | "za";

export interface SearchSortOptions {
  query?: string;
  sort?: SortOption;
}
