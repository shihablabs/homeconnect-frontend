
"use client";

import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";
import { useEffect, useMemo } from "react";

interface FormImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string; 
  maxFiles?: number;
  label?: string;
  onRemove?: (index: number) => void;
}

export function FormImageUpload({ value, onChange, error, maxFiles = 10, label, onRemove }: FormImageUploadProps) {
  const files = value || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles].slice(0, maxFiles)); 
    }
  };

  const removeImage = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      onChange(files.filter((_, i) => i !== index));
    }
  };

  const previews = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div>
      <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 border-2 border-dashed rounded-lg transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary'}`}>
        {previews.map((src, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100"
          >
            {}
            {}
            <img
              src={src}
              alt={`Preview ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {files.length < maxFiles && (
          <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-white">
            <UploadCloud className="w-8 h-8" />
            <span className="text-xs text-center mt-2 px-2">
              {label || `Upload (${files.length}/${maxFiles})`}
            </span>
            <Input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {}
      {files.length === 0 && (
        <div className="mt-2 flex flex-col items-center justify-center text-gray-400">
          <p className="text-xs">Upload up to {maxFiles} images.</p>
        </div>
      )}

      {}
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
