
'use client';

import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/lib/types';


interface FileUploaderProps {
  files: (File | ProductImage)[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: { [key: string]: string[] };
}

export function FileUploader({
  files,
  onFilesChange,
  maxFiles = 15,
  accept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip'],
    'text/csv': ['.csv'],
  },
}: FileUploaderProps) {
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

      let newFiles;
      if (maxFiles > 1) {
        newFiles = [...files, ...acceptedFiles].slice(0, maxFiles) as File[];
      } else {
        newFiles = acceptedFiles.slice(0, 1);
      }
      onFilesChange(newFiles);
    },
    [files, onFilesChange, maxFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: maxFiles,
    multiple: maxFiles > 1,
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index) as File[];
    onFilesChange(newFiles);
  };

  const previews = useMemo(() => files.map((file, index) => {
    const isImage = file instanceof File && file.type?.startsWith('image/');
    const url = file instanceof File ? URL.createObjectURL(file) : (file as ProductImage).url;
    const name = file instanceof File ? file.name : 'Image';
    
    return (
      <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border">
        {isImage ? (
            <Image src={url} alt="File preview" fill className="object-cover" />
        ) : (
            <div className="flex flex-col items-center justify-center h-full bg-muted p-2">
                <p className="text-xs text-center break-all">{name}</p>
            </div>
        )}
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
  }), [files, removeFile]);

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
              <p className="font-semibold">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                Up to {maxFiles} file(s) (10MB each).
              </p>
            </div>
          )}
        </div>
      </div>
      {files.length > 0 && maxFiles > 1 && (
        <div className="space-y-2">
            <p className="font-medium text-sm flex items-center gap-2"><ImageIcon className="h-5 w-5"/> File Previews</p>
            <div className="flex flex-wrap gap-2">
                {previews}
            </div>
        </div>
      )}
    </div>
  );
}
