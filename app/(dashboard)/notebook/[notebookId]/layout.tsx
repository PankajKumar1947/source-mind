import { NotebookProvider } from "@/context/notebook-context"

export default async function NotebookLayout({
  children
}: { children: React.ReactNode }) {

  return (
    <NotebookProvider>
      {children}
    </NotebookProvider>
  )
}
