"use client";

import * as React from "react";
import { useState } from "react";
import { BookOpen, Calendar, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteNotebook } from "@/lib/actions/notebook.action";
import { DeleteDialog } from "@/components/shared/delete-dialog";

interface NotebookItemProps {
  notebookId: string;
  title: string;
  createdAt: string | Date;
  onClick: () => void;
}

export function NotebookItem({ notebookId, title, createdAt, onClick }: NotebookItemProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteNotebook({ notebookId });
      if (result.success) {
        toast.success("Notebook deleted successfully");
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete notebook");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div
        onClick={onClick}
        className="border border-border bg-card hover:border-brand-primary/40 rounded-xl p-5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md flex flex-col justify-between gap-4 group relative"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmOpen(true);
          }}
          className="absolute top-4 right-4 size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          title="Delete notebook"
        >
          <Trash2 className="size-4" />
        </button>

        <div>
          <div className="size-9 rounded-lg bg-brand-primary-muted text-brand-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground text-base mt-4 group-hover:text-brand-primary transition-colors duration-200">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground border-t border-border/40 pt-3">
          <Calendar className="size-4" />
          <span className="text-sm">
            Created {new Date(createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <DeleteDialog
        open={isConfirmOpen}
        setOpen={setIsConfirmOpen}
        itemName={title}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
