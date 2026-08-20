import * as React from "react";
import { 
  FileText, 
  Globe, 
  Video, 
  CheckCircle2, 
  Loader2, 
  Database 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IngestItem {
  name: string;
  type: "PDF" | "URL" | "YT";
  sizeOrDuration: string;
  status: "ready" | "processing";
  progressText: string;
  percent?: number;
}

const ITEMS: IngestItem[] = [
  { 
    name: "market_research_report.pdf", 
    type: "PDF", 
    sizeOrDuration: "1.4 MB", 
    status: "ready", 
    progressText: "Ready to query" 
  },
  { 
    name: "docs.qdrant.tech/indexing", 
    type: "URL", 
    sizeOrDuration: "42 pages", 
    status: "ready", 
    progressText: "Ready to query" 
  },
  { 
    name: "vector_indexing_session.yt", 
    type: "YT", 
    sizeOrDuration: "14m 20s", 
    status: "processing", 
    progressText: "Transcribing audio...", 
    percent: 78 
  },
];

export function IngestConsole({ className }: { className?: string }) {
  return (
    <div
      role="region"
      aria-label="Document Import Status"
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl font-sans text-sm",
        className
      )}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Database className="size-4 text-brand-primary" />
          <span className="font-semibold text-foreground">Imported Sources</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-emerald">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-emerald opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-emerald" />
          </span>
          ACTIVE
        </span>
      </div>

      {/* Widget Body */}
      <div className="p-5 flex flex-col gap-4 bg-card">
        {ITEMS.map((item) => (
          <div 
            key={item.name} 
            className="p-4 rounded-lg border border-border bg-muted/10 flex flex-col gap-3 transition-colors hover:border-brand-primary/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded",
                  item.type === "PDF" && "bg-brand-rose-muted text-brand-rose",
                  item.type === "URL" && "bg-brand-emerald-muted text-brand-emerald",
                  item.type === "YT" && "bg-brand-red-muted text-brand-red"
                )}>
                  {item.type === "PDF" && <FileText className="size-4" />}
                  {item.type === "URL" && <Globe className="size-4" />}
                  {item.type === "YT" && <Video className="size-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sizeOrDuration}</p>
                </div>
              </div>

              {/* Status Badge */}
              {item.status === "ready" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald bg-brand-emerald-muted px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="size-3.5" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent bg-brand-accent-muted px-2 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="size-3.5 animate-spin" /> Processing
                </span>
              )}
            </div>

            {/* Ingestion progress representation */}
            {item.status === "processing" && (
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{item.progressText}</span>
                  <span className="text-brand-accent">{item.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-accent transition-all duration-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Widget Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground font-mono">
        <span>local_storage_db</span>
        <span className="text-brand-primary font-sans font-medium">3 active sources</span>
      </div>
    </div>
  );
}
