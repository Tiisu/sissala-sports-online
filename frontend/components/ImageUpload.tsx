'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
}

export default function ImageUpload({
  label,
  currentImage,
  onImageChange,
  error,
  accept = 'image/jpeg,image/png,image/jpg,image/webp',
  maxSize = 5,
  required = false
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onImageChange(null);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image file.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageChange(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label} {required && <span className="text-status-error">*</span>}
      </label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-text-tertiary bg-background-light">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-status-error text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Change Image
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full h-64 rounded-lg border-2 border-dashed 
            ${isDragging ? 'border-primary-green bg-primary-green/5' : 'border-text-tertiary'}
            ${error ? 'border-status-error' : ''}
            hover:border-primary-green hover:bg-background-light/50 
            transition-colors cursor-pointer flex flex-col items-center justify-center gap-4
          `}
        >
          <ImageIcon className={`w-16 h-16 ${isDragging ? 'text-primary-green' : 'text-text-tertiary'}`} />
          <div className="text-center">
            <p className="text-text-primary font-medium mb-1">
              {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-text-secondary">
              PNG, JPG, WEBP up to {maxSize}MB
            </p>
          </div>
          <div className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Choose File
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="text-status-error text-sm mt-1">{error}</p>
      )}

      <p className="text-sm text-text-secondary mt-2">
        Recommended: Square image (1:1 ratio) for best results
      </p>
    </div>
  );
}
