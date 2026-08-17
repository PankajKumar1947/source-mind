import { NotebookProvider } from "@/components/providers/notebook-provider"

export default async function NotebookLayout({
  children
}: { children: React.ReactNode }) {

  return (
    <div className="p-8">
      <NotebookProvider>
        {children}
      </NotebookProvider>
    </div>
  )
}
