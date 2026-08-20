import * as React from "react";
import { BookOpen, Calendar } from "lucide-react";

interface NotebookItemProps {
  title: string;
  createdAt: string | Date;
  onClick: () => void;
}

export function NotebookItem({ title, createdAt, onClick }: NotebookItemProps) {
  return (
    <div
      onClick={onClick}
      className="border border-border bg-card hover:border-brand-primary/40 rounded-xl p-5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md flex flex-col justify-between gap-4 group"
    >
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
  );
}
