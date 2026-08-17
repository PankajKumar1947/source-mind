"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, FileUp, Globe, Video, BookOpen } from "lucide-react"
import { BaseDialog } from "@/components/shared/base-dialog"
import { FileUploader } from "@/components/shared/file-uploader"
import { addSource } from "@/lib/actions/source.action"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UploadResponse } from "@imagekit/next"
import { useNotebook, getSourceIcon } from "@/components/providers/notebook-provider"

export function NotebookSources() {
  const router = useRouter()
  const { activeNotebook: notebook, refreshNotebook } = useNotebook();
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isWebLinkOpen, setIsWebLinkOpen] = useState(false)
  const [webLinkUrl, setWebLinkUrl] = useState("")
  const [webLinkTitle, setWebLinkTitle] = useState("")
  const [isSubmittingLink, setIsSubmittingLink] = useState(false)

  const handleUploadSuccess = async (res: UploadResponse) => {
    if (!notebook) return;

    let sourceType: "PDF" | "TEXT" = "PDF";
    if (res.name?.toLowerCase().endsWith(".txt")) {
      sourceType = "TEXT";
    }

    if (!res.filePath) {
      toast.error("Upload succeeded, but file path is missing");
      return;
    }

    try {
      const result = await addSource({
        notebookId: notebook?.notebookId,
        title: res.name || "Untitled Source",
        sourceType,
        storageKey: res.filePath,
      });

      if (result.success) {
        toast.success("Source added to notebook");
        setIsUploadOpen(false);
        router.refresh();
        refreshNotebook();
      } else {
        toast.error(result.message || "Failed to add source");
      }
    } catch (err: unknown) {
      console.error("DB Save Error:", err);
      toast.error("Failed to add source to database");
    }
  }

  const handleWebLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notebook || !webLinkUrl.trim()) return;

    setIsSubmittingLink(true);
    try {
      let finalTitle = webLinkTitle.trim();
      if (!finalTitle) {
        try {
          finalTitle = new URL(webLinkUrl).hostname || "Web Link";
        } catch {
          finalTitle = "Web Link";
        }
      }

      const result = await addSource({
        notebookId: notebook.notebookId,
        title: finalTitle,
        sourceType: "WEB_LINK",
        storageKey: webLinkUrl.trim(),
        url: webLinkUrl.trim(),
      });

      if (result.success) {
        toast.success("Web link added to notebook");
        setIsWebLinkOpen(false);
        setWebLinkUrl("");
        setWebLinkTitle("");
        router.refresh();
        refreshNotebook();
      } else {
        toast.error(result.message || "Failed to add web link");
      }
    } catch (err: unknown) {
      console.error("Web Link Add Error:", err);
      toast.error("Failed to add web link. Please ensure the URL is valid.");
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleTypeClick = (type: string) => {
    if (type === "PDF" || type === "TEXT") {
      setIsUploadOpen(true);
    } else if (type === "Web Link") {
      setIsWebLinkOpen(true);
    } else {
      toast.info(`${type} Under implementation`);
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Add Source Card Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Add Source</h2>
        <div className="border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-card/30">
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            {/* PDF Card */}
            <button
              onClick={() => handleTypeClick("PDF")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <FileText className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">PDF</span>
            </button>

            {/* YT Link Card */}
            <button
              onClick={() => handleTypeClick("YT Link")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <Video className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">YT Link</span>
            </button>

            {/* Text Card */}
            <button
              onClick={() => handleTypeClick("TEXT")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <FileUp className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">Text</span>
            </button>

            {/* VTT Card */}
            <button
              onClick={() => handleTypeClick("VTT")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <BookOpen className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">VTT</span>
            </button>
          </div>

          {/* Web Link Card (spans 2 rows on desktop) */}
          <button
            onClick={() => handleTypeClick("Web Link")}
            className="flex flex-col items-center justify-center gap-2 md:h-full h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group md:row-span-2"
          >
            <Globe className="size-6 text-primary group-hover:scale-105 transition-transform" />
            <span className="text-sm font-medium text-foreground">Web Link</span>
          </button>
        </div>
      </div>

      {/* Sources List Card */}
      <Card className="shadow-xs border border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Sources
            </CardTitle>
            <CardDescription>
              Upload documents, links, or media files to train your notebook.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {notebook?.sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg border-muted-foreground/30">
              <FileUp className="size-10 text-muted-foreground mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-foreground">No sources added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add PDF files, web links, or text to start analyzing.</p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border bg-card">
              {notebook?.sources.map((source) => (
                <div key={source.sourceId} className="flex items-center justify-between p-3.5 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {getSourceIcon(source.sourceType)}
                    <span className="font-medium truncate text-foreground">
                      {source.title || "Untitled Source"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {source.sourceType}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-current text-muted-foreground">
                      {source.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BaseDialog
        title="Add Source"
        description="Select a PDF or text file to upload to your notebook."
        open={isUploadOpen}
        setOpen={setIsUploadOpen}
        size="md"
      >
        <FileUploader
          folder={`/source-mind/${notebook?.userId}/${notebook?.title.replace(/[^a-zA-Z0-9-_]/g, "-")}`}
          onUploadSuccess={handleUploadSuccess}
          accept="application/pdf,text/plain"
        />
      </BaseDialog>

      <BaseDialog
        title="Add Web Link"
        description="Provide a URL to crawl and add to your notebook."
        open={isWebLinkOpen}
        setOpen={setIsWebLinkOpen}
        size="md"
      >
        <form onSubmit={handleWebLinkSubmit} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="web-link-url" className="text-sm font-medium text-foreground">
              URL
            </label>
            <Input
              id="web-link-url"
              type="url"
              placeholder="https://example.com"
              value={webLinkUrl}
              onChange={(e) => setWebLinkUrl(e.target.value)}
              required
              disabled={isSubmittingLink}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="web-link-title" className="text-sm font-medium text-foreground">
              Title (Optional)
            </label>
            <Input
              id="web-link-title"
              type="text"
              placeholder="Example Website"
              value={webLinkTitle}
              onChange={(e) => setWebLinkTitle(e.target.value)}
              disabled={isSubmittingLink}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWebLinkOpen(false)}
              disabled={isSubmittingLink}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingLink}>
              {isSubmittingLink ? "Adding..." : "Add Link"}
            </Button>
          </div>
        </form>
      </BaseDialog>
    </div>
  )
}
