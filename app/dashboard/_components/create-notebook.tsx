"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNotebook } from "@/lib/actions/notebook.action";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNotebookSchema, CreateNotebookInput } from "@/api/notebook/notebook.validation";

export function CreateNotebook() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNotebookInput>({
    resolver: zodResolver(createNotebookSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(data: CreateNotebookInput) {
    try {
      const result = await createNotebook(data);
      if (result.success) {
        toast.success("Notebook created successfully");
        reset();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create notebook");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <div className="border border-border bg-card/60 rounded-xl p-5 shadow-sm">
      <label htmlFor="notebook-title" className="block text-sm font-semibold text-foreground mb-2">
        Create a New Notebook
      </label>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="notebook-title"
            type="text"
            placeholder="e.g., Q4 Market Analysis, Thesis Research..."
            disabled={isSubmitting}
            className="grow h-11 text-sm bg-muted/10 border-border"
            {...register("title")}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 h-11 rounded-lg font-semibold text-sm transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Plus className="size-4" /> Create Notebook
              </>
            )}
          </Button>
        </div>
        {errors.title && (
          <p className="text-sm text-destructive font-medium mt-1">
            {errors.title.message}
          </p>
        )}
      </form>
    </div>
  );
}
