import React, { useRef, useEffect, useState } from 'react';
import { ImageData } from '../types/image';
import { drawCaptionText } from './CaptionRenderer';
import './CaptionedImageDisplay.css';

interface CaptionedImageDisplayProps {
  image: ImageData;
  className?: string;
}

export const CaptionedImageDisplay: React.FC<CaptionedImageDisplayProps> = ({
  image,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    const renderCaptionedImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !image.captions || image.captions.length === 0) {
        setIsRendering(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsRendering(false);
        return;
      }

      try {
        // Use the cropped image if available, otherwise use original
        const sourceImage = image.croppedImage || image;
        const imageUrl = sourceImage.url;
        const imageDimensions = sourceImage.dimensions || { width: 800, height: 600 };

        // Set canvas size to match image
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Load and draw the base image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Draw the base image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });

        // Draw each saved caption using the improved scaling logic
        image.captions.forEach((caption) => {
          if (caption.text.trim()) {
            drawCaptionText(ctx, caption, canvas.width, canvas.height);
          }
        });

        setIsRendering(false);
      } catch (error) {
        console.error('Failed to render captioned image:', error);
        setIsRendering(false);
      }
    };

    renderCaptionedImage();
  }, [image.captions, image.croppedImage?.url, image.url, image.dimensions]);

  // If no captions, show original image
  if (!image.captions || image.captions.length === 0) {
    const sourceImage = image.croppedImage || image;
    return (
      <div className={`captioned-image-display ${className}`}>
        <img
          src={sourceImage.url}
          alt={image.name}
          className="captioned-image-display__image"
        />
      </div>
    );
  }

  return (
    <div className={`captioned-image-display ${className}`}>
      {isRendering && (
        <div className="captioned-image-display__loading">
          <div className="captioned-image-display__spinner" />
          <p>Rendering captions...</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`captioned-image-display__canvas ${isRendering ? 'captioned-image-display__canvas--hidden' : ''}`}
      />
    </div>
  );
};

