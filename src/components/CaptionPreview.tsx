import React, { useState, useCallback, useMemo } from 'react';
import { Caption, VINTAGE_MOVIE_PRESET } from '../types/caption';
import { ImageData } from '../types/image';
import { CaptionInput } from './CaptionInput';
import { CaptionRenderer } from './CaptionRenderer';
import { SaveImageButton } from './SaveImageButton';
import { useStableCaption } from '../hooks/useStableCaption';
import './CaptionPreview.css';

interface CaptionPreviewProps {
  image: ImageData;
  onBack: () => void;
  onSaveCaption: (caption: Caption) => void;
  className?: string;
}

export const CaptionPreview: React.FC<CaptionPreviewProps> = ({
  image,
  onBack,
  onSaveCaption,
  className = '',
}) => {
  // Initialize caption with existing caption from image or default
  const [caption, setCaption] = useState<Caption>(() => {
    const existingCaption = image.captions?.[0];
    return existingCaption || {
      id: 'main-caption',
      text: '',
      style: VINTAGE_MOVIE_PRESET.style,
      position: VINTAGE_MOVIE_PRESET.defaultPosition,
    };
  });

  const handleCaptionChange = useCallback((newCaption: Caption) => {
    setCaption(newCaption);
  }, []);

  const handlePresetChange = useCallback(() => {
    // Preset change is handled in CaptionInput through handleCaptionChange
  }, []);

  // Use stable caption to prevent unnecessary re-renders
  const stableCaption = useStableCaption(caption);
  const hasCaptionText = stableCaption.text.trim().length > 0;

  // Create a temporary ImageData for the save button - use the image with captions
  const captionedImageData: ImageData = useMemo(() => {
    return {
      ...image,
      // Add the current caption to the image data
      captions: hasCaptionText ? [stableCaption] : undefined,
    };
  }, [image, stableCaption, hasCaptionText]);

  return (
    <div className={`caption-preview ${className}`}>
      <div className="caption-preview__header">
        <button
          onClick={onBack}
          className="caption-preview__back-btn"
          type="button"
        >
          ← Back to Crop
        </button>
        <h2 className="caption-preview__title">Add Movie Caption</h2>
      </div>

      <div className="caption-preview__content">
        <div className="caption-preview__image-section">
          <CaptionRenderer
            image={image}
            captions={hasCaptionText ? [stableCaption] : []}
            className="caption-preview__renderer"
            key={`${image.url}-${image.croppedImage?.url || 'no-crop'}`}
          />
        </div>

        <div className="caption-preview__controls">
          <CaptionInput
            caption={caption}
            onCaptionChange={handleCaptionChange}
            onPresetChange={handlePresetChange}
            className="caption-preview__input"
          />

          {hasCaptionText && (
            <div className="caption-preview__actions">
              <div className="caption-preview__action-buttons">
                <button
                  onClick={() => onSaveCaption(stableCaption)}
                  className="caption-preview__save-caption-btn"
                  type="button"
                >
                  💾 Save Caption to Image
                </button>
                
                <SaveImageButton
                  image={captionedImageData}
                  preferCropped={false}
                  variant="primary"
                  size="large"
                  filename={`${image.name.replace(/\.[^/.]+$/, '')}_captioned.png`}
                  className="caption-preview__save-btn"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
