"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useParams, usePathname } from "next/navigation"
import { getNotebookById } from "@/services/notebook.service"
import { FileText, FileUp, Globe, Video, BookOpen } from "lucide-react"

export interface Source {
  sourceId: string
  title: string | null
  sourceType: "PDF" | "TEXT" | "WEB_LINK" | "YT_VIDEO" | "VTT"
  status: "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING"
  createdAt: Date
}

export interface Chat {
  chatId: string
  title: string
  createdAt: Date
}

export interface Notebook {
  notebookId: string
  title: string
  sources: Source[]
  chats: Chat[]
  userId: string
  createdAt: Date
}

interface NotebookContextType {
  activeNotebook: Notebook | null
  isLoading: boolean
  refreshNotebook: () => Promise<void>
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined)

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const activeNotebookId = params.notebookId as string

  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotebook = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const data = await getNotebookById(id)
      if (data) {
        setActiveNotebook(data)
      } else {
        setActiveNotebook(null)
      }
    } catch (error) {
      console.error("Error fetching active notebook:", error)
      setActiveNotebook(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeNotebookId) {
      fetchNotebook(activeNotebookId)
    } else {
      setActiveNotebook(null)
    }
  }, [activeNotebookId, fetchNotebook])

  const refreshNotebook = useCallback(async () => {
    if (activeNotebookId) {
      await fetchNotebook(activeNotebookId)
    }
  }, [activeNotebookId, fetchNotebook])

  return (
    <NotebookContext.Provider value={{ activeNotebook, isLoading, refreshNotebook }}>
      {children}
    </NotebookContext.Provider>
  )
}

export function useNotebook() {
  const context = useContext(NotebookContext)
  if (context === undefined) {
    throw new Error("useNotebook must be used within a NotebookProvider")
  }
  return context
}

export const getSourceIcon = (type: Source["sourceType"], className?: string) => {
  const baseClass = className || "size-4"
  switch (type) {
    case "PDF":
      return <FileText className={`${baseClass} text-red-500`} />
    case "TEXT":
      return <FileUp className={`${baseClass} text-blue-500`} />
    case "WEB_LINK":
      return <Globe className={`${baseClass} text-emerald-500`} />
    case "YT_VIDEO":
      return <Video className={`${baseClass} text-purple-500`} />
    default:
      return <BookOpen className={`${baseClass} text-zinc-500`} />
  }
}

