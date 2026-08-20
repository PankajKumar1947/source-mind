import * as React from "react";
import { cn } from "@/lib/utils";

interface TechSpecCardProps extends React.ComponentPropsWithoutRef<"div"> {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function TechSpecCard({
  icon,
  title,
  description,
  className,
  ...props
}: TechSpecCardProps) {
  return (
    <div
      className={cn(
        "border border-border/80 rounded p-6 bg-card/40 hover:border-brand-primary/40 transition-colors flex flex-col font-mono",
        className
      )}
      {...props}
    >
      <div className="flex aspect-square size-10 items-center justify-center rounded border border-border bg-muted/10 text-brand-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-sm uppercase mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}
