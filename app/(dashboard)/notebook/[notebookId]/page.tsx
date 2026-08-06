import { notFound } from "next/navigation"
import { getNotebookById } from "@/services/notebook.service"
import { NotebookDetail } from "../_components/notebook-detail"

interface PageProps {
  params: Promise<{
    notebookId: string
  }>
}

export default async function NotebookPage({ params }: PageProps) {
  const { notebookId } = await params;

  const currentNotebook = await getNotebookById(notebookId)

  if (!currentNotebook) {
    notFound()
  }

  return (
    <NotebookDetail notebook={currentNotebook} />
  )
}
