<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Styling & Component Development Rules

All styling and component generation must follow these strict guidelines:

1. **Separation of CSS Design Tokens**:
   - Do **NOT** define color hexes, custom fonts, or theme variables inline inside components or directly inside [`app/globals.css`](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/app/globals.css).
   - All tokens (colors, font-families, border radiuses, custom theme styles) must be defined as CSS Custom Properties in [`app/token.css`](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/app/token.css) under `:root` and `.dark` blocks.
   - [`app/token.css`](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/app/token.css) is imported inside [`app/globals.css`](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/app/globals.css).
   - Always reference these named tokens in code (e.g., standard Tailwind classes or `var(--name)` CSS custom properties).

2. **Component Creation & Reuse**:
   - Check if the primitive or wrapper component already exists in `components/ui/` or `components/shared/` before creating a new one.
   - For any shadcn/ui installation, configuration, or wrapper component creation, you **must use the custom `shadcn` skill** (located at [shadcn SKILL.md](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/.agents/skills/shadcn/SKILL.md)).

For comprehensive instructions, refer to the custom [`ui-generation` skill](file:///Users/pankaj/Developer/Learning/gen-ai-cohort/source-mind/.agents/skills/ui-generation/SKILL.md).
