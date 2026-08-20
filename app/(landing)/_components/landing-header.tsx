import * as React from "react";
import { Logo } from "./logo";
import { Header } from "@/components/layout/header";

export function LandingHeader() {
  return (
    <div className="sticky top-4 z-50 w-full flex justify-center px-4">
      <nav className="w-full max-w-7xl border border-border/80 bg-background/80 backdrop-blur-md rounded-full px-6 shadow-md">
        <div className="h-16 flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex items-center gap-8 text-sm font-sans">
            <a href="#register" className="text-muted-foreground hover:text-brand-primary transition-colors">Sources</a>
            <a href="#pipeline" className="text-muted-foreground hover:text-brand-primary transition-colors">How it Works</a>
            <a href="#spec" className="text-muted-foreground hover:text-brand-primary transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-4">
            <Header />
          </div>
        </div>
      </nav>
    </div>
  );
}
