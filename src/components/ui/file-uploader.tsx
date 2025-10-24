
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  files: (File | { url: string; id: string })[];
  onFilesChange: (files: (File | { url: string; id: string })[]) => void;
  maxFiles?: number;
}

export function FileUploader({ files, onFilesChange, maxFiles = 5 }: FileUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }: any) => {
          errors.forEach((error: any) => {
            toast({
              variant: 'destructive',
              title: `Error uploading ${file.name}`,
              description: error.message,
            });
          });
        });
      }

      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    },
    [files, onFilesChange, maxFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/gif': ['.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxFiles,
    multiple: true,
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const previews = useMemo(() => files.map((file, index) => {
    const url = file instanceof File ? URL.createObjectURL(file) : file.url;
    return (
      <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border">
        <Image src={url} alt="Product image preview" fill className="object-cover" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={(e) => {
              e.stopPropagation();
              removeFile(index)
            }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }), [files]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10',
          files.length >= maxFiles && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="w-12 h-12 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <div>
              <p className="font-semibold">Drag & drop images here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                Up to {maxFiles} images (5MB each). Supports JPG, PNG, GIF.
              </p>
            </div>
          )}
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
            <p className="font-medium text-sm flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Image Previews</p>
            <div className="flex flex-wrap gap-2">
                {previews}
            </div>
        </div>
      )}
    </div>
  );
}
