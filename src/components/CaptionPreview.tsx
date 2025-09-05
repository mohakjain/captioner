import React, { useState, useCallback, useMemo } from 'react';
import { Caption, VINTAGE_MOVIE_PRESET as CAPTION_PRESET } from '../types/caption';
import { ImageData, VintageMode } from '../types/image';
import { CaptionInput } from './CaptionInput';
import { CaptionRenderer } from './CaptionRenderer';
import { SaveImageButton } from './SaveImageButton';
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
  // Initialize vintage mode state (default to Classic as requested)
  const [vintageMode, setVintageMode] = useState<VintageMode>(
    image.vintageMode ?? VintageMode.Classic // Default to Classic if not set
  );
  
  // Initialize caption with existing caption from image or default
  const [caption, setCaption] = useState<Caption>(() => {
    const existingCaption = image.captions?.[0];
    return existingCaption || {
      id: 'main-caption',
      text: '',
      style: CAPTION_PRESET.style,
      position: CAPTION_PRESET.defaultPosition,
    };
  });

  const handleCaptionChange = useCallback((newCaption: Caption) => {
    setCaption(newCaption);
  }, []);

  const handlePresetChange = useCallback(() => {
    // Preset change is handled in CaptionInput through handleCaptionChange
  }, []);

  const handleVintageModeChange = useCallback((mode: VintageMode) => {
    setVintageMode(mode);
  }, []);

  // Use memoized caption to prevent unnecessary re-renders
  const stableCaption = useMemo(() => caption, [
    caption.text, 
    caption.style.color, 
    caption.style.fontSize, 
    caption.style.fontFamily,
    caption.style.fontStyle,
    caption.style.strokeColor,
    caption.style.strokeWidth,
    caption.style.shadowColor,
    caption.style.shadowBlur,
    caption.style.shadowOffsetX,
    caption.style.shadowOffsetY,
    caption.style.lineHeight,
    caption.position.x,
    caption.position.y,
    caption.position.alignment,
    caption.id
  ]);
  const hasCaptionText = stableCaption.text.trim().length > 0;

  // Create a temporary ImageData for the save button - use the image with captions and vintage mode
  const captionedImageData: ImageData = useMemo(() => {
    return {
      ...image,
      // Add the current caption to the image data
      captions: hasCaptionText ? [stableCaption] : undefined,
      // Include vintage mode setting
      vintageMode: vintageMode,
    };
  }, [image, stableCaption, hasCaptionText, vintageMode]);

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
            image={{...image, vintageMode}}
            captions={hasCaptionText ? [stableCaption] : []}
            className="caption-preview__renderer"
            key={`${image.url}-${image.croppedImage?.url || 'no-crop'}-${vintageMode}`}
          />
        </div>

        <div className="caption-preview__controls">
          <CaptionInput
            caption={caption}
            onCaptionChange={handleCaptionChange}
            onPresetChange={handlePresetChange}
            vintageMode={vintageMode}
            onVintageModeChange={handleVintageModeChange}
            className="caption-preview__input"
          />

          {(
            <div className="caption-preview__actions">
              <div className="caption-preview__action-buttons">
                <SaveImageButton
                  image={captionedImageData}
                  preferCropped={true}
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
