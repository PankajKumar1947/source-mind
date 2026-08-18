"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, FileUp, Globe, Video, BookOpen } from "lucide-react"
import { BaseDialog } from "@/components/shared/base-dialog"
import { FileUploader } from "@/components/shared/file-uploader"
import { addSource } from "@/lib/actions/source.action"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { upload, UploadResponse } from "@imagekit/next"
import { useNotebook, getSourceIcon } from "@/components/providers/notebook-provider"

export function NotebookSources() {
  const router = useRouter()
  const { notebookSlug } = useParams()
  const { activeNotebook: notebook, refreshNotebook } = useNotebook();
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isWebLinkOpen, setIsWebLinkOpen] = useState(false)
  const [webLinkUrl, setWebLinkUrl] = useState("")
  const [webLinkTitle, setWebLinkTitle] = useState("")
  const [isSubmittingLink, setIsSubmittingLink] = useState(false)
  const [isTextOpen, setIsTextOpen] = useState(false)
  const [textTitle, setTextTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  const [isSubmittingText, setIsSubmittingText] = useState(false)
  const [isYtOpen, setIsYtOpen] = useState(false)
  const [ytUrl, setYtUrl] = useState("")
  const [ytTitle, setYtTitle] = useState("")
  const [isSubmittingYt, setIsSubmittingYt] = useState(false)

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
        const errorMessage = result.errors?.url?.[0] || result.message || "Failed to add web link";
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      console.error("Web Link Add Error:", err);
      toast.error("Failed to add web link. Please ensure the URL is valid.");
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notebook || !textContent.trim() || !textTitle.trim()) return;

    setIsSubmittingText(true);
    try {
      const result = await addSource({
        notebookId: notebook.notebookId,
        title: textTitle.trim(),
        sourceType: "TEXT",
        content: textContent.trim(),
      });

      if (result.success) {
        toast.success("Text added to notebook");
        setIsTextOpen(false);
        setTextTitle("");
        setTextContent("");
        router.refresh();
        refreshNotebook();
      } else {
        const errorMessage = result.errors?.content?.[0] || result.errors?.title?.[0] || result.message || "Failed to add text source";
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      console.error("Text Add Error:", err);
      toast.error("Failed to add text. Please try again.");
    } finally {
      setIsSubmittingText(false);
    }
  };

  const handleYtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notebook || !ytUrl.trim()) return;

    setIsSubmittingYt(true);
    try {
      let finalTitle = ytTitle.trim();
      if (!finalTitle) {
        finalTitle = "YouTube Video";
      }

      const result = await addSource({
        notebookId: notebook.notebookId,
        title: finalTitle,
        sourceType: "YT_VIDEO",
        url: ytUrl.trim(),
      });

      if (result.success) {
        toast.success("YouTube source added to notebook");
        setIsYtOpen(false);
        setYtUrl("");
        setYtTitle("");
        router.refresh();
        refreshNotebook();
      } else {
        const errorMessage = result.errors?.url?.[0] || result.message || "Failed to add YouTube source";
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      console.error("YouTube Add Error:", err);
      toast.error("Failed to add YouTube video. Please ensure the URL is valid.");
    } finally {
      setIsSubmittingYt(false);
    }
  };

  const handleTypeClick = (type: string) => {
    if (type === "PDF") {
      setIsUploadOpen(true);
    } else if (type === "TEXT") {
      setIsTextOpen(true);
    } else if (type === "Web Link") {
      setIsWebLinkOpen(true);
    } else if (type === "YT Link") {
      setIsYtOpen(true);
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
                    <Link 
                      href={`/n/${notebookSlug}/sources/${source.sourceId}`}
                      className="font-medium truncate text-foreground hover:text-primary hover:underline transition-colors"
                    >
                      {source.title || "Untitled Source"}
                    </Link>
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

      <BaseDialog
        title="Add Custom Text"
        description="Write or paste custom text to add to your notebook."
        open={isTextOpen}
        setOpen={setIsTextOpen}
        size="md"
      >
        <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="text-title" className="text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              id="text-title"
              type="text"
              placeholder="My Custom Text Note"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              required
              disabled={isSubmittingText}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="text-content" className="text-sm font-medium text-foreground">
              Content
            </label>
            <textarea
              id="text-content"
              placeholder="Write or paste your custom text notes here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isSubmittingText}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTextOpen(false)}
              disabled={isSubmittingText}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingText}>
              {isSubmittingText ? "Adding..." : "Add Text"}
            </Button>
          </div>
        </form>
      </BaseDialog>

      <BaseDialog
        title="Add YouTube Video"
        description="Provide a YouTube URL to fetch its transcript and add to your notebook."
        open={isYtOpen}
        setOpen={setIsYtOpen}
        size="md"
      >
        <form onSubmit={handleYtSubmit} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="yt-url" className="text-sm font-medium text-foreground">
              YouTube Video URL
            </label>
            <Input
              id="yt-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              required
              disabled={isSubmittingYt}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="yt-title" className="text-sm font-medium text-foreground">
              Title (Optional)
            </label>
            <Input
              id="yt-title"
              type="text"
              placeholder="My Video Source"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
              disabled={isSubmittingYt}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsYtOpen(false)}
              disabled={isSubmittingYt}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingYt}>
              {isSubmittingYt ? "Adding..." : "Add Video"}
            </Button>
          </div>
        </form>
      </BaseDialog>
    </div>
  )
}
