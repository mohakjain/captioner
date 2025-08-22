import React from 'react';
import { AspectRatio, ASPECT_RATIOS } from '../types/image';
import './CropControls.css';

interface CropControlsProps {
  selectedAspectRatio: AspectRatio;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
  onStartCrop: () => void;
  className?: string;
}

export const CropControls: React.FC<CropControlsProps> = ({
  selectedAspectRatio,
  onAspectRatioChange,
  onStartCrop,
  className = '',
}) => {
  return (
    <div className={`crop-controls ${className}`}>
      <div className="crop-controls__section">
        <h3 className="crop-controls__title">Crop Settings</h3>
        
        <div className="crop-controls__aspect-ratios">
          <label className="crop-controls__label">Aspect Ratio:</label>
          <div className="crop-controls__ratio-grid">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                onClick={() => onAspectRatioChange(ratio)}
                className={`crop-controls__ratio-btn ${
                  selectedAspectRatio.label === ratio.label 
                    ? 'crop-controls__ratio-btn--active' 
                    : ''
                }`}
                type="button"
              >
                <span className="crop-controls__ratio-label">{ratio.label}</span>
                <span className="crop-controls__ratio-value">{ratio.displayRatio}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onStartCrop}
          className="crop-controls__start-btn"
          type="button"
        >
          🖼️ Start Cropping
        </button>
      </div>
    </div>
  );
};
