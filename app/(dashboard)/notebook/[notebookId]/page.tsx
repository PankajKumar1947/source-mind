"use client";

import { notFound, redirect } from "next/navigation"
import { useNotebook } from "@/context/notebook-context"

export default function NotebookPage() {
  const { activeNotebook } = useNotebook();

  if (!activeNotebook) {
    notFound()
  }

  const hasChat = activeNotebook.chats && activeNotebook.chats.length > 0;
  if (hasChat) {
    redirect(`/notebook/${activeNotebook.notebookId}/chat`);
  } else {
    redirect(`/notebook/${activeNotebook.notebookId}/sources`);
  }
}
