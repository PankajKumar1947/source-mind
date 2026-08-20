"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SortOption } from "@/api/shared/common.type";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const initialQuery = searchParams.get("query") || "";
  const initialSort = (searchParams.get("sort") as SortOption) || "newest";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  // Synchronize local states if URL parameters change externally
  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "");
    setSortBy((searchParams.get("sort") as SortOption) || "newest");
  }, [searchParams]);

  // Debounced Search query router update
  useEffect(() => {
    const currentQueryParam = searchParams.get("query") || "";
    if (searchQuery !== currentQueryParam) {
      const delayDebounceFn = setTimeout(() => {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (searchQuery.trim()) {
            params.set("query", searchQuery.trim());
          } else {
            params.delete("query");
          }
          router.push(`${pathname}?${params.toString()}`);
        });
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, pathname, router, searchParams]);

  function handleSortChange(value: string) {
    const nextSort = value as SortOption;
    setSortBy(nextSort);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextSort !== "newest") {
        params.set("sort", nextSort);
      } else {
        params.delete("sort");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-lg font-bold text-foreground">Your Notebooks</h2>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative grow sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm bg-muted/10 border-border"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-10 text-sm flex items-center justify-center gap-2 border-border cursor-pointer select-none"
              >
                <ArrowUpDown className="size-4 text-muted-foreground" />
                <span>
                  Sort: {sortBy === "newest" ? "Newest" :
                    sortBy === "oldest" ? "Oldest" :
                      sortBy === "az" ? "A-Z" : "Z-A"}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-sm font-semibold">Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                <DropdownMenuRadioItem value="newest" className="text-sm cursor-pointer">
                  Created: Newest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest" className="text-sm cursor-pointer">
                  Created: Oldest First
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="az" className="text-sm cursor-pointer">
                  Alphabetical: A-Z
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="za" className="text-sm cursor-pointer">
                  Alphabetical: Z-A
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
