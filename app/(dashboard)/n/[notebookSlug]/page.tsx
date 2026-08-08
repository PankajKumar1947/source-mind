"use client";

import { notFound, redirect } from "next/navigation"
import { useNotebook, slugify } from "@/context/notebook-context"

export default function NotebookPage() {
  const { activeNotebook } = useNotebook();

  if (!activeNotebook) {
    notFound()
  }

  const slug = slugify(activeNotebook.title);
  const hasChat = activeNotebook.chats && activeNotebook.chats.length > 0;
  if (hasChat) {
    redirect(`/n/${slug}/chat`);
  } else {
    redirect(`/n/${slug}/sources`);
  }
}
