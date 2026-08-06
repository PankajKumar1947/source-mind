'use client';

import { ReactNode } from 'react';
import { BaseDialog } from './base-dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
  title?: string;
  description?: string | ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  itemName?: string;
}

export function DeleteDialog({
  title = "Confirm Deletion",
  description,
  open,
  setOpen,
  onConfirm,
  isPending = false,
  itemName,
}: DeleteDialogProps) {
  const defaultDescription = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : "Are you sure you want to delete this item? This action cannot be undone.";

  return (
    <BaseDialog
      title={title}
      description={description || defaultDescription}
      open={open}
      setOpen={setOpen}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
