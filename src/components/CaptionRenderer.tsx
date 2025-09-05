import React, { useRef, useEffect, useCallback } from 'react';
import { Caption, CaptionStyle } from '../types/caption';
import { ImageData } from '../types/image';

interface CaptionRendererProps {
  image: ImageData;
  captions: Caption[];
  className?: string;
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({
  image,
  captions,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCaptionsToCanvas = useCallback(async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Draw each caption
    captions.forEach((caption) => {
      if (caption.text.trim()) {
        drawCaptionText(ctx, caption, canvas.width, canvas.height);
      }
    });
  }, [
    image.croppedImage?.url, 
    image.url, 
    image.dimensions?.width,
    image.dimensions?.height,
    captions.map(c => 
      `${c.text}-${c.style.fontFamily}-${c.style.fontSize}-${c.style.fontStyle}-${c.style.color}-${c.style.strokeColor}-${c.style.strokeWidth}-${c.style.shadowColor}-${c.style.shadowBlur}-${c.style.shadowOffsetX}-${c.style.shadowOffsetY}-${c.style.lineHeight}-${c.position.x}-${c.position.y}-${c.position.alignment}`
    ).join('|')
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderCaptionsToCanvas().catch(console.error);
    }, 300); // Increased debounce to prevent rapid re-renders

    return () => clearTimeout(timeoutId);
  }, [renderCaptionsToCanvas]);

  return (
    <div className={`caption-renderer ${className}`}>
      <canvas
        ref={canvasRef}
        className="caption-renderer__canvas"
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
};

// Helper function to draw caption text with vintage movie styling
function drawCaptionText(
  ctx: CanvasRenderingContext2D,
  caption: Caption,
  canvasWidth: number,
  canvasHeight: number
): void {
  const { text, style, position } = caption;
  
  // Calculate font size as percentage of image width for consistent scaling
  // fontSize in style is percentage (e.g., 4 = 4% of image width)
  const calculatedFontSize = (style.fontSize / 100) * canvasWidth;
  
  // Apply reasonable bounds: minimum 12px, maximum 10% of canvas width
  const minFontSize = 12;
  const maxFontSize = canvasWidth * 0.1;
  const fontSize = Math.max(minFontSize, Math.min(calculatedFontSize, maxFontSize));
  
  // Set up text styling
  ctx.font = `${style.fontStyle} ${fontSize}px ${style.fontFamily}`;
  ctx.textAlign = position.alignment as CanvasTextAlign;
  ctx.textBaseline = 'middle';
  
  // Calculate position in pixels
  const x = (position.x / 100) * canvasWidth;
  const y = (position.y / 100) * canvasHeight;
  
  // Split text into lines for better wrapping
  const maxWidth = canvasWidth * 0.8; // 80% of canvas width
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = fontSize * style.lineHeight;
  const totalHeight = lines.length * lineHeight;
  const startY = y - (totalHeight / 2);
  
  // Scale other properties relative to font size for consistency
  const scaleFactor = fontSize / 32; // Base scale factor (32px was the original size)
  const scaledStrokeWidth = Math.max(3, style.strokeWidth * scaleFactor);
  const scaledShadowBlur = Math.max(1, style.shadowBlur * scaleFactor)  ;
  const scaledShadowOffsetX = style.shadowOffsetX * scaleFactor;
  const scaledShadowOffsetY = style.shadowOffsetY * scaleFactor;
  
  // Draw each line with full vintage styling
  lines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    
    // Draw shadow first (behind everything)
    if (style.shadowBlur > 0) {
      ctx.save();
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = scaledShadowBlur;
      ctx.shadowOffsetX = scaledShadowOffsetX;
      ctx.shadowOffsetY = scaledShadowOffsetY;
      ctx.fillStyle = style.color;
      ctx.fillText(line, x, lineY);
      ctx.restore();
    }
    
    // Draw stroke (outline)
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = scaledStrokeWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(line, x, lineY);
    }
    
    // Draw fill text (main text color)
    ctx.fillStyle = style.color;
    ctx.fillText(line, x, lineY);
  });
}

// Helper function to wrap text to fit within max width
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}

export { drawCaptionText, wrapText };
