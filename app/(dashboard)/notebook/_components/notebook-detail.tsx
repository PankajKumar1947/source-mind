"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, FileText, Globe, Video, FileUp, AlertTriangle } from "lucide-react"

interface Source {
  sourceId: string
  sourceType: "PDF" | "TEXT" | "WEB_LINK" | "YT_VIDEO" | "VTT"
  title: string | null
  status: "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING"
  createdAt: Date
}

interface Chat {
  chatId: string
  title: string
  createdAt: Date
}

interface Notebook {
  notebookId: string
  title: string
  sources: Source[]
  chats: Chat[]
  createdAt: Date
}

export function NotebookDetail({ notebook }: { notebook: Notebook }) {
  const getSourceIcon = (type: Source["sourceType"]) => {
    switch (type) {
      case "PDF":
        return <FileText className="size-4 text-red-500" />
      case "TEXT":
        return <FileUp className="size-4 text-blue-500" />
      case "WEB_LINK":
        return <Globe className="size-4 text-emerald-500" />
      case "YT_VIDEO":
        return <Video className="size-4 text-purple-500" />
      default:
        return <BookOpen className="size-4 text-zinc-500" />
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="size-8 text-primary" />
          {notebook.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Created on {new Date(notebook.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xs border border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Sources
            </CardTitle>
            <CardDescription>
              Upload documents, links, or media files to train your notebook.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notebook.sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg border-muted-foreground/30">
                <FileUp className="size-10 text-muted-foreground mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium text-foreground">No sources added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add PDF files, web links, or text to start analyzing.</p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border bg-card">
                {notebook.sources.map((source) => (
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

        <Card className="shadow-xs border border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Recent Chats
            </CardTitle>
            <CardDescription>
              Previous conversations and analysis logs for this notebook.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notebook.chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg border-muted-foreground/30">
                <BookOpen className="size-10 text-muted-foreground mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium text-foreground">No active chats</p>
                <p className="text-xs text-muted-foreground mt-1">Start chatting with this notebook to ask questions about sources.</p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border bg-card">
                {notebook.chats.map((chat) => (
                  <div key={chat.chatId} className="flex items-center justify-between p-3.5 text-sm hover:bg-muted/40 cursor-pointer transition-colors">
                    <span className="font-medium text-foreground truncate">{chat.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
