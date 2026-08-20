import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Brain, 
  Database, 
  Compass, 
  ArrowRight,
  Cpu,
  UploadCloud,
  Search
} from "lucide-react";
import { LandingHeader } from "./_components/landing-header";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { TechSpecCard } from "./_components/tech-spec-card";
import { SourceRegistryTable, SourceRegistryItem } from "./_components/source-registry-table";
import { IngestConsole } from "./_components/ingest-console";

const mockRegistryItems: SourceRegistryItem[] = [
  { 
    id: "SRC-001", 
    name: "market_research_report.pdf", 
    type: "PDF", 
    vectorPayload: "PDF Document", 
    status: "INDEXED" 
  },
  { 
    id: "SRC-002", 
    name: "docs.qdrant.tech/indexing", 
    type: "URL", 
    vectorPayload: "Website Link", 
    status: "INDEXED" 
  },
  { 
    id: "SRC-003", 
    name: "vector_indexing_session.yt", 
    type: "YT", 
    vectorPayload: "YouTube Video", 
    status: "PARSING" 
  },
];

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-brand-primary-muted overflow-x-hidden flex flex-col font-sans text-sm">
      
      <LandingHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-10 md:pt-16 pb-20 relative z-10 flex flex-col">

        <section className="grid items-center gap-12 pb-16 md:pb-24 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="mb-7 flex items-center gap-2 text-sm font-semibold text-brand-primary uppercase tracking-wider">
              <span>Personal Knowledge Base</span>
            </p>

            <h1 className="font-display font-bold uppercase tracking-tight leading-none text-4xl sm:text-5xl xl:text-6xl text-foreground">
              Read it once.
              <br />
              Query it forever.
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block w-2.5 h-5 translate-y-0.5 animate-caret-blink bg-brand-emerald motion-reduce:animate-none"
              />
            </h1>

            <p className="mt-7 max-w-md font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
              Source Mind runs on your machine: PDFs, saved pages, and transcripts are chunked and embedded into a local
              vector index. Ask a question, and it answers by stitching context across your sources.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                id="cta-get-started"
                href="/sign-up"
                className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium rounded px-5 py-3 shadow transition-colors text-center uppercase text-sm"
              >
                Get Started for Free
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
              <a
                id="cta-register"
                href="#register"
                className="flex items-center justify-center gap-2 border border-border bg-card hover:bg-muted/50 text-foreground font-medium rounded px-5 py-3 transition-colors text-center uppercase text-sm"
              >
                View Sources
              </a>
            </div>

            <p className="mt-10 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Upload Document</span>
              <ArrowRight aria-hidden="true" className="size-4 text-brand-accent" />
              <span>Smart Indexing</span>
              <ArrowRight aria-hidden="true" className="size-4 text-brand-accent" />
              <span>Ask AI</span>
            </p>
          </div>

          <IngestConsole className="mx-auto w-full max-w-xl lg:max-w-none" />
        </section>

        <section id="register" className="w-full mb-20">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">Imported Sources</h2>
          </div>

          <SourceRegistryTable items={mockRegistryItems} />
        </section>

        <section id="pipeline" className="w-full mb-20">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">How it Works</h2>
          </div>

          <div className="w-full border border-border/80 rounded bg-card/60 backdrop-blur p-6 flex flex-col lg:flex-row gap-8 items-stretch">

            <div className="flex-1 border border-border/80 rounded bg-background/50 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground border-b border-border pb-2 uppercase">
                <UploadCloud className="size-4 text-brand-primary" /> 1. Import & Analyze
              </div>

              <div className="flex flex-col gap-3 font-sans text-sm">
                <div className="p-3.5 rounded border border-border/60 bg-muted/10">
                  <span className="text-brand-accent font-bold text-xs uppercase font-mono">Step 01: Extract Content</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Automatically parse and read text from your PDFs, saved web links, or YouTube transcripts.
                  </p>
                </div>
                <div className="p-3.5 rounded border border-border/60 bg-muted/10">
                  <span className="text-brand-accent font-bold text-xs uppercase font-mono">Step 02: Understand Concepts</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Map similar topics and keywords together so the system understands the actual meaning of your text.
                  </p>
                </div>
                <div className="p-3.5 rounded border border-border/60 bg-muted/10">
                  <span className="text-brand-accent font-bold text-xs uppercase font-mono">Step 03: Save to Notebook</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Store processed contents securely in your local document database, ready for chat.
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col justify-center items-center gap-3 py-6">
              <div className="h-full w-px bg-border/80 flex-1" />
              <div className="p-2 border border-border rounded-full bg-background text-brand-primary">
                <ArrowRight className="size-4 rotate-90 lg:rotate-0" />
              </div>
              <div className="h-full w-px bg-border/80 flex-1" />
            </div>

            <div className="flex-1 border border-border/80 rounded bg-background/50 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground border-b border-border pb-2 uppercase">
                <Compass className="size-4 text-brand-accent" /> 2. Ask & Get Answers
              </div>

              <div className="flex-1 flex flex-col gap-3 p-3 rounded bg-muted/5 border border-border/40 overflow-y-auto h-72">
                <Bubble align="end">
                  <BubbleContent className="text-sm">
                    Explain how vector similarity retrieves my documents.
                  </BubbleContent>
                </Bubble>

                <div className="text-sm text-brand-primary bg-brand-primary-muted border border-brand-primary/20 rounded p-2.5 flex items-center gap-2 font-mono">
                  <Cpu className="size-4 animate-spin" />
                  <span>Searching: "Finding similar text blocks and concepts..."</span>
                </div>

                <Bubble align="start" variant="secondary" className="max-w-md">
                  <BubbleContent className="text-sm border-none flex flex-col gap-1.5 font-sans">
                    <p className="leading-relaxed">
                      The AI searches your uploaded notebook, locates the most relevant paragraphs by matching the meaning of your question, and compiles a natural answer with direct citations.
                    </p>
                    <div className="text-xs text-muted-foreground pt-1.5 border-t border-border/40 font-mono">
                      Citation: Qdrant Indexing Guide
                    </div>
                  </BubbleContent>
                </Bubble>
              </div>
            </div>

          </div>
        </section>

        <section id="spec" className="w-full mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">Core Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            <TechSpecCard
              icon={<UploadCloud className="size-5" />}
              title="Background Import"
              description="Upload PDF documents, import YouTube transcripts, or crawl complete webpage links in the background while you continue working."
            />

            <TechSpecCard
              icon={<Search className="size-5" />}
              title="Smart Search"
              description="Get answers based on the actual meaning and context of your documents, not just raw, simple keyword matching."
            />

            <TechSpecCard
              icon={<Database className="size-5" />}
              title="Private & Secure"
              description="Your parsed document text and indices are stored securely on your machine for complete local privacy."
            />

          </div>
        </section>

        <section className="w-full py-12 text-center rounded border border-border/80 bg-muted/5 mt-12 relative overflow-hidden">
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-4">Start Building Your Second Brain</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 font-sans">
            Create an account to start importing documents and conversing with your files.
          </p>
          <div className="flex justify-center">
            <Link
              id="cta-bottom-get-started"
              href="/sign-up"
              className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium rounded px-5 py-3 shadow transition-colors text-sm uppercase"
            >
              Get Started for Free
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-border/60 py-8 bg-muted/10 mt-auto text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="size-4 text-brand-primary" />
            <span>© {new Date().getFullYear()} Source Mind. Your private AI document notebook.</span>
          </div>
          <div className="flex gap-6 uppercase">
            <a href="#" className="hover:text-brand-primary">Terms of Service</a>
            <a href="#" className="hover:text-brand-primary">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
