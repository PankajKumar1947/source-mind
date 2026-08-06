'use client';

import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

type DialogSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'full';

const sizeClasses: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  full: 'sm:max-w-full',
};

interface BaseDialogProps {
  title: string;
  triggerLabel?: string | ReactNode;
  children: ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
  className?: string; // If provided, overrides default structural classes
  customTrigger?: React.ReactElement;
  size?: DialogSize;
  description?: string | ReactNode;
  onCloseButtonClick?: () => void;
  footer?: ReactNode;
}

export function BaseDialog({
  title,
  triggerLabel,
  children,
  open: controlledOpen,
  setOpen: controlledSetOpen,
  triggerVariant = 'ghost',
  triggerSize = 'sm',
  className,
  customTrigger,
  size,
  description,
  onCloseButtonClick,
  footer,
}: BaseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledSetOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledSetOpen : setInternalOpen;

  const baseClassName = className ?? 'p-0';

  const widthClass = size
    ? sizeClasses[size]
    : !className
      ? 'sm:max-w-5xl lg:max-w-6xl'
      : '';

  const finalClassName = cn(baseClassName, widthClass);

  const triggerContent = customTrigger ? (
    <DialogTrigger render={customTrigger} />
  ) : triggerLabel ? (
    <DialogTrigger
      render={
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className="rounded-full"
        >
          {triggerLabel}
        </Button>
      }
    />
  ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerContent}
      <DialogContent
        className={cn('flex max-h-[90vh] flex-col gap-0 p-0', finalClassName)}
        onCloseButtonClick={onCloseButtonClick}
        aria-describedby={undefined}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-center text-xl font-semibold capitalize">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

        {footer && (
          <div className="border-t p-6 bg-muted/20">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
