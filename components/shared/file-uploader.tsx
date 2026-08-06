'use client';

import { useRef, useState, useTransition } from 'react';
import { upload, ImageKitUploadNetworkError, ImageKitServerError, ImageKitAbortError, type UploadResponse } from '@imagekit/next';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploaderProps {
  folder: string;
  onUploadSuccess?: (res: UploadResponse) => void;
  onUploadError?: (err: Error) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUploader({
  folder,
  onUploadSuccess,
  onUploadError,
  accept = 'application/pdf,text/plain',
  maxSizeMB = 10,
  className,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const authenticator = async () => {
    const response = await fetch('/api/upload-auth');
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }
    return response.json();
  };

  const handleFile = async (file: File) => {
    // Basic validations
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds limit of ${maxSizeMB}MB`);
      return;
    }

    setCurrentFile(file);
    setIsUploading(true);
    setProgress(0);

    // Set up AbortController for cancelability
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const authParams = await authenticator();
      
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        publicKey: authParams.publicKey,
        folder,
        onProgress: (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
        abortSignal: controller.signal,
      });

      toast.success('File uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess(uploadResponse);
      resetState();
    } catch (error: unknown) {
      if (error instanceof ImageKitAbortError) {
        toast.info('Upload cancelled');
      } else {
        console.error('Upload error details:', error);
        const errorMsg = error instanceof ImageKitServerError || error instanceof ImageKitUploadNetworkError
          ? error.message
          : 'File upload failed. Please try again.';
        toast.error(errorMsg);
        if (onUploadError && error instanceof Error) onUploadError(error);
      }
      resetState();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resetState = () => {
    setCurrentFile(null);
    setIsUploading(false);
    setProgress(0);
    abortControllerRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn('w-full max-w-xl mx-auto flex flex-col gap-4', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept={accept}
        className="hidden"
        disabled={isUploading}
      />

      {!isUploading ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all gap-3 bg-muted/20 border-border hover:bg-muted/40 hover:border-primary/50',
            isDragActive && 'border-primary bg-primary/5 scale-[0.98]'
          )}
        >
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-background border border-border shadow-xs">
            <UploadCloud className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <p className="text-sm font-semibold text-foreground">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF or Text files (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-5 border border-border rounded-xl bg-card gap-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <File className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate text-foreground">
                  {currentFile?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentFile ? (currentFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCancel}
              title="Cancel Upload"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin text-primary" />
                Uploading document...
              </span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      )}
    </div>
  );
}
