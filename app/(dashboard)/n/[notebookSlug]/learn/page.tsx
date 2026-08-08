"use client"

import { Layers, BookOpen, Award, FileText, Map } from "lucide-react"
import { toast } from "sonner"

export default function LearnPage() {
  const handleToolClick = (tool: string) => {
    toast.info(`${tool} Under implementation`)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">AI Learning Tools</h2>
        <div className="border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-card/30">
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            {/* Flashcards */}
            <button
              onClick={() => handleToolClick("Flashcards")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <Layers className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">Flashcards</span>
            </button>

            {/* Study Guide */}
            <button
              onClick={() => handleToolClick("Study Guide")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <BookOpen className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">Study Guide</span>
            </button>

            {/* Quiz */}
            <button
              onClick={() => handleToolClick("Quiz")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <Award className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">Quiz</span>
            </button>

            {/* Summary */}
            <button
              onClick={() => handleToolClick("Summary")}
              className="flex flex-col items-center justify-center gap-2 h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <FileText className="size-6 text-primary group-hover:scale-105 transition-transform" />
              <span className="text-sm font-medium text-foreground">Summary</span>
            </button>
          </div>

          {/* Roadmap Card (spans 2 rows on desktop) */}
          <button
            onClick={() => handleToolClick("Learning Roadmap")}
            className="flex flex-col items-center justify-center gap-2 md:h-full h-28 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group md:row-span-2"
          >
            <Map className="size-6 text-primary group-hover:scale-105 transition-transform" />
            <span className="text-sm font-medium text-foreground">Roadmap</span>
          </button>
        </div>
      </div>
    </div>
  )
}
