'use client';

import React, { useState, useRef } from 'react';

interface UploadMediaProps {
  onUpload: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  accept?: string;
  multiple?: boolean;
  style?: React.CSSProperties;
}

export default function UploadMedia({
  onUpload,
  title = 'Click to upload or drag & drop',
  subtitle = 'Image, video, carousel',
  accept = 'image/*',
  multiple = true,
  style
}: UploadMediaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        cursor: 'pointer',
        ...style
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      <div className="upload-icon-wrapper">
        <svg className="upload-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <span className="upload-title">{title}</span>
      <span className="upload-subtitle">{subtitle}</span>
    </div>
  );
}
