"use client";

import { useActionState } from "react";
import { createNotebook } from "@/actions/notebook.action";

export default function Home() {
  const [state, formAction, isPending] = useActionState(createNotebook, {
    success: false,
    message: "",
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Create Notebook</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-zinc-900 dark:text-zinc-50"
          />
          {state.errors?.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {state.errors.title[0]}
            </p>
          )}
        </div>

        {state.message && !state.success && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition duration-200 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
