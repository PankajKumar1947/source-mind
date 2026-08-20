"use client";

import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { slugify } from "@/components/providers/notebook-provider";
import { INotebook } from "@/api/notebook/notebook.type";
import { CreateNotebook } from "./create-notebook";
import { NotebookItem } from "./notebook-item";
import { SearchFilter } from "./search-filter";

export function DashboardContent({ notebooks }: { notebooks: INotebook[] }) {
  console.log(notebooks)
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8 font-sans">

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to Source Mind</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new notebook or select an existing one to begin organizing and querying your documents.
        </p>
      </div>

      {/* Creation input box */}
      <CreateNotebook />

      {/* List of all notebooks */}
      <div className="flex flex-col gap-4">
        
        {/* Server-side Search & Filter component */}
        <SearchFilter />

        {notebooks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/5 flex flex-col items-center justify-center">
            <BookOpen className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">No notebooks found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search query or create a new notebook above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => {
              const slug = slugify(notebook.title);
              return (
                <NotebookItem
                  key={notebook.notebookId}
                  title={notebook.title}
                  createdAt={notebook.createdAt}
                  onClick={() => router.push(`/n/${slug}`)}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
