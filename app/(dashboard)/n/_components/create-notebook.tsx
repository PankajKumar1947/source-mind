'use client';

import { useState, useTransition } from "react"
import { BaseDialog } from "@/components/shared/base-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createNotebook } from "@/lib/actions/notebook.action"
import { useRouter } from "next/navigation"

import { toast } from "sonner"

interface CreateNotebookProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CreateNotebook({ open, setOpen }: CreateNotebookProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !title.trim()) return

    startTransition(async () => {
      const result = await createNotebook({ title: title.trim() })
      if (result.success) {
        setTitle("")
        setOpen(false)
        toast.success("Notebook created successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to create notebook")
      }
    })
  }

  return (
    <BaseDialog
      title="Create Notebook"
      description="Enter a name for your new notebook. Click save when you're done."
      open={open}
      setOpen={setOpen}
      size="lg"
    >
      <form onSubmit={handleCreate}>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            placeholder="My Awesome Notebook"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  )
}
