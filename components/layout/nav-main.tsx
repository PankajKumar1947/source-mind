"use client"

import { useState, useTransition } from "react"
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
import { CreateNotebook } from "@/app/(dashboard)/notebook/_components/create-notebook"
import { MoreHorizontal, Eye, Trash2, BookOpen, Plus } from "lucide-react"
import { deleteNotebook } from "@/actions/notebook.action"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

interface Notebook {
  notebookId: string
  title: string
  createdAt: Date
  userId: string
}

export function NavMain({
  notebooks = [],
}: {
  notebooks: Notebook[]
}) {
  const router = useRouter()
  const params = useParams()
  const activeNotebookId = params.notebookId as string
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notebookToDelete, setNotebookToDelete] = useState<{ id: string; title: string } | null>(null)

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

  const handleView = (notebookId: string) => {
    router.push(`/notebook/${notebookId}`)
  }

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
          const isActive = notebook.notebookId === activeNotebookId
          return (
            <SidebarMenuItem key={notebook.notebookId}>
              <SidebarMenuButton
                isActive={isActive}
                onClick={() => handleView(notebook.notebookId)}
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
                  <DropdownMenuItem onClick={() => handleView(notebook.notebookId)}>
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
