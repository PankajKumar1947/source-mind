"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { getNotebookBySlug } from "@/lib/data/notebook"
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
  const activeNotebookSlug = params.notebookSlug as string

  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotebook = useCallback(async (slug: string) => {
    setIsLoading(true)
    try {
      const data = await getNotebookBySlug(slug)
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
    if (activeNotebookSlug) {
      fetchNotebook(activeNotebookSlug)
    } else {
      setActiveNotebook(null)
    }
  }, [activeNotebookSlug, fetchNotebook])

  const refreshNotebook = useCallback(async () => {
    if (activeNotebookSlug) {
      await fetchNotebook(activeNotebookSlug)
    }
  }, [activeNotebookSlug, fetchNotebook])

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
  const themeClass = `${baseClass} text-primary`
  switch (type) {
    case "PDF":
      return <FileText className={themeClass} />
    case "TEXT":
      return <FileUp className={themeClass} />
    case "WEB_LINK":
      return <Globe className={themeClass} />
    case "YT_VIDEO":
      return <Video className={themeClass} />
    default:
      return <BookOpen className={themeClass} />
  }
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

