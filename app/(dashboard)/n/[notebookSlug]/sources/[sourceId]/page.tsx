import { notFound } from "next/navigation";
import { getSourceById } from "@/lib/data/source";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, Globe, Video, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SourceDetailsPageProps {
  params: Promise<{
    notebookSlug: string;
    sourceId: string;
  }>;
}

export default async function SourceDetailsPage({ params }: SourceDetailsPageProps) {
  const { notebookSlug, sourceId } = await params;
  const source = await getSourceById(sourceId);

  if (!source) {
    notFound();
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "WEB_LINK":
        return <Globe className="h-6 w-6 text-blue-500" />;
      case "YT_VIDEO":
        return <Video className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back button */}
      <div>
        <Link 
          href={`/n/${notebookSlug}/sources`}
          className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sources
        </Link>
      </div>

      {/* Main Header details card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-3 bg-muted/50 rounded-xl border border-border/40 shrink-0">
                {getSourceIcon(source.sourceType)}
              </div>
              <div className="space-y-1 min-w-0">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {source.title || "Untitled Source"}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-0.5 rounded border border-border/30">
                    {source.sourceType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(source.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium border border-current bg-background capitalize flex items-center gap-1.5 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {source.status.toLowerCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="border-t border-border/50 pt-4 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {source.url && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source URL</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs truncate bg-background px-2.5 py-1 rounded border border-border/30 block flex-1">
                    {source.url}
                  </span>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "icon-xs" }))}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
            {source.storageKey && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage Path</span>
                <span className="font-mono text-xs truncate bg-background px-2.5 py-1 rounded border border-border/30 block">
                  {source.storageKey}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content panel card */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Source Content</CardTitle>
          <CardDescription>
            {source.sourceType === "TEXT" 
              ? "View the custom text content saved in this source."
              : `This source references a ${source.sourceType.toLowerCase()} file. Use the external link button to view it.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {source.sourceType === "TEXT" ? (
            <div className="border border-border/50 rounded-xl bg-muted/30 p-4 max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground font-sans">
              {source.content || <span className="italic text-muted-foreground">Empty content.</span>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl border-border/60 bg-muted/10 gap-3">
              <ExternalLink className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">View original document</p>
                <p className="text-xs text-muted-foreground">
                  The contents of this {source.sourceType} source are stored externally.
                </p>
              </div>
              {source.url && (
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "default" }), "gap-2 mt-2")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Document Link
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
