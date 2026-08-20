import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SourceRegistryItem {
  id: string;
  name: string;
  type: "PDF" | "URL" | "YT";
  vectorPayload: string;
  status: "INDEXED" | "PARSING";
}

interface SourceRegistryTableProps extends React.ComponentPropsWithoutRef<"div"> {
  items: SourceRegistryItem[];
}

export function SourceRegistryTable({
  items,
  className,
  ...props
}: SourceRegistryTableProps) {
  return (
    <div
      className={cn(
        "w-full border border-border bg-card rounded-xl shadow-sm overflow-x-auto font-sans text-sm",
        className
      )}
      {...props}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold text-xs tracking-wider">
            <th className="p-4 pl-6">Name</th>
            <th className="p-4">Source Type</th>
            <th className="p-4 pr-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/10 transition-colors">
              <td className="p-4 pl-6 font-medium text-foreground">{item.name}</td>
              <td className="p-4">
                {item.type === "PDF" && (
                  <Badge variant="outline" className="text-brand-rose bg-brand-rose-muted border-none rounded-full px-3 py-0.5">
                    PDF Document
                  </Badge>
                )}
                {item.type === "URL" && (
                  <Badge variant="outline" className="text-brand-emerald bg-brand-emerald-muted border-none rounded-full px-3 py-0.5">
                    Website Link
                  </Badge>
                )}
                {item.type === "YT" && (
                  <Badge variant="outline" className="text-brand-red bg-brand-red-muted border-none rounded-full px-3 py-0.5">
                    YouTube Video
                  </Badge>
                )}
              </td>
              <td className="p-4 pr-6">
                {item.status === "INDEXED" ? (
                  <div className="flex items-center gap-2 font-medium text-brand-emerald">
                    <Check className="size-4" /> Ready to Chat
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-medium text-brand-accent animate-pulse">
                    <Loader2 className="size-4 animate-spin" /> Analyzing text...
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
