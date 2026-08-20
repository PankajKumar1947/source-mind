import * as React from "react";
import { cn } from "@/lib/utils";

interface SystemStatusProps extends React.ComponentPropsWithoutRef<"div"> {
  status?: string;
  indexStore?: string;
  embedding?: string;
  pipeline?: string;
}

export function SystemStatus({
  status = "OPERATIONAL",
  indexStore = "QDRANT_LOCAL",
  embedding = "MISTRAL_EMBED_V1",
  pipeline = "HYDE_RETRIEVE_STITCH",
  className,
  ...props
}: SystemStatusProps) {
  return (
    <div
      className={cn(
        "w-full border border-border/80 rounded bg-muted/10 p-4 flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground font-mono",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
        <span>SYS_STATUS: {status}</span>
      </div>
      <div className="flex gap-6">
        <span>INDEX_STORE: {indexStore}</span>
        <span>EMBEDDING: {embedding}</span>
        <span>PIPELINE: {pipeline}</span>
      </div>
    </div>
  );
}
