"use client"

import { useState, useTransition, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { CreateNotebook } from "@/app/(dashboard)/n/_components/create-notebook"
import {
  MoreHorizontal,
  Eye,
  Trash2,
  BookOpen,
  Plus,
  MessageSquare,
  FileText,
  GraduationCap,
  Settings,
  ArrowLeft,
  FileUp,
  Globe,
  Video
} from "lucide-react"
import { deleteNotebook } from "@/lib/actions/notebook.action"
import { getSourceIcon, slugify } from "@/components/providers/notebook-provider"
import { getNotebookBySlug } from "@/lib/data/notebook"
import { useRouter, useParams, usePathname } from "next/navigation"
import { toast } from "sonner"

interface Notebook {
  notebookId: string
  title: string
  createdAt: Date
  userId: string
}

interface Source {
  sourceId: string
  title: string | null
  sourceType: "PDF" | "TEXT" | "WEB_LINK" | "YT_VIDEO" | "VTT"
  status: string
}

export function NavMain({
  notebooks = [],
}: {
  notebooks: Notebook[]
}) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const activeNotebookSlug = params.notebookSlug as string
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notebookToDelete, setNotebookToDelete] = useState<{ id: string; title: string } | null>(null)

  // Active notebook details (for sources section)
  const [activeNotebook, setActiveNotebook] = useState<{ title: string; sources: Source[] } | null>(null)

  useEffect(() => {
    if (!activeNotebookSlug) {
      setActiveNotebook(null)
      return
    }

    const fetchSources = async () => {
      const data = await getNotebookBySlug(activeNotebookSlug)
      if (data) {
        setActiveNotebook(data)
      }
    }

    fetchSources()
  }, [activeNotebookSlug, pathname])

  const handleConfirmDelete = async () => {
    if (!notebookToDelete) return

    startTransition(async () => {
      const result = await deleteNotebook({ notebookId: notebookToDelete.id })
      if (result.success) {
        setDeleteOpen(false)
        setNotebookToDelete(null)
        toast.success("Notebook deleted successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to delete notebook")
      }
    })
  }

  const handleView = (title: string) => {
    router.push(`/n/${slugify(title)}`)
  }



  // Render Notebook Details Sidebar if in a notebook
  if (activeNotebookSlug) {
    const navItems = [
      { name: "Chat", icon: MessageSquare, path: `/n/${activeNotebookSlug}/chat` },
      { name: "Sources", icon: FileText, path: `/n/${activeNotebookSlug}/sources` },
      { name: "Learn", icon: GraduationCap, path: `/n/${activeNotebookSlug}/learn` },
      { name: "Settings", icon: Settings, path: `/n/${activeNotebookSlug}/settings` },
    ]

    return (
      <div className="flex flex-col gap-4">
        {/* Back Button */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4 shrink-0" />
                <span>Back to Notebooks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Notebook Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3">Notebook Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => router.push(item.path)}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Sources List */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3">Sources</SidebarGroupLabel>
          <SidebarMenu>
            {activeNotebook?.sources.map((source) => (
              <SidebarMenuItem key={source.sourceId}>
                <SidebarMenuButton className="cursor-default select-none pointer-events-none">
                  {getSourceIcon(source.sourceType, "size-4 shrink-0")}
                  <span className="truncate">{source.title || "Untitled Source"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {activeNotebook && activeNotebook.sources.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No sources added.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </div>
    )
  }

  // Render Default Sidebar
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Notebooks</SidebarGroupLabel>
      <SidebarGroupAction
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        title="Create Notebook"
      >
        <Plus className="size-4" />
      </SidebarGroupAction>
      <SidebarMenu>
        {notebooks.map((notebook) => {
          const isActive = slugify(notebook.title) === activeNotebookSlug
          return (
            <SidebarMenuItem key={notebook.notebookId}>
              <SidebarMenuButton
                isActive={isActive}
                onClick={() => handleView(notebook.title)}
              >
                <BookOpen className="size-4 shrink-0" />
                <span>{notebook.title}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  }
                />
                <DropdownMenuContent side="right" align="start" className="w-40 rounded-lg">
                  <DropdownMenuItem onClick={() => handleView(notebook.title)}>
                    <Eye className="mr-2 size-4 text-muted-foreground" />
                    <span>View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setNotebookToDelete({ id: notebook.notebookId, title: notebook.title })
                      setDeleteOpen(true)
                    }}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-2 size-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        {notebooks.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No notebooks found.
          </div>
        )}
      </SidebarMenu>

      <CreateNotebook
        open={isOpen}
        setOpen={setIsOpen}
      />

      <DeleteDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        itemName={notebookToDelete?.title}
        isPending={isPending}
      />
    </SidebarGroup>
  )
}

