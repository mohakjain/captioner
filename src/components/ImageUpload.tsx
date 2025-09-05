import React, { useRef, useCallback, useState } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File) => Promise<void>;
  isProcessing?: boolean;
  error?: string | null;
  className?: string;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  isProcessing = false,
  error,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return `File type not supported. Please use: ${ACCEPTED_FORMATS.map(f => f.split('/')[1]).join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      // For now, we'll just log the error. In a real app, you'd want to show this to the user
      console.error(validationError);
      return;
    }
    
    await onImageSelect(file);
  }, [onImageSelect]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (isProcessing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  }, [handleFileSelect, isProcessing]);

  const handleClick = useCallback(() => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  return (
    <div className={`image-upload ${className}`}>
      <div
        className={`image-upload__dropzone ${dragActive ? 'image-upload__dropzone--active' : ''} ${
          isProcessing ? 'image-upload__dropzone--processing' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS.join(',')}
          onChange={handleFileChange}
          className="image-upload__input"
          aria-hidden="true"
          tabIndex={-1}
        />
        
        <div className="image-upload__content">
          {isProcessing ? (
            <div className="image-upload__processing">
              <div className="image-upload__spinner" />
              <p>Processing image...</p>
            </div>
          ) : (
            <>
              <div className="image-upload__icon">📸</div>
              <h3 className="image-upload__title">Upload Image</h3>
              <p className="image-upload__description">
                Drag and drop an image here, or click to browse
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="image-upload__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
