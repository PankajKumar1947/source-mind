import * as React from "react";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.ComponentPropsWithoutRef<"div"> {
  iconSize?: number;
}

export function Logo({ iconSize = 5, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 font-sans", className)} {...props}>
      <div className="flex aspect-square size-9 items-center justify-center rounded border border-border bg-muted/30 text-brand-primary">
        <Brain className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-base tracking-tight text-foreground leading-none">
          Source Mind
        </span>
        <span className="text-sm text-muted-foreground tracking-wider uppercase font-semibold mt-1">
          AI Document Notebook
        </span>
      </div>
    </div>
  );
}
