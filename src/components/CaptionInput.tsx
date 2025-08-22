import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Caption, CaptionPreset, CAPTION_PRESETS } from '../types/caption';
import './CaptionInput.css';

interface CaptionInputProps {
  caption: Caption;
  onCaptionChange: (caption: Caption) => void;
  onPresetChange: (preset: CaptionPreset) => void;
  className?: string;
}

export const CaptionInput: React.FC<CaptionInputProps> = ({
  caption,
  onCaptionChange,
  onPresetChange,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCaption = {
      ...caption,
      text: e.target.value,
    };
    onCaptionChange(newCaption);
  }, [caption, onCaptionChange]);

  const handlePresetSelect = useCallback((preset: CaptionPreset) => {
    const newCaption: Caption = {
      ...caption,
      style: preset.style,
      position: preset.defaultPosition,
    };
    onCaptionChange(newCaption);
    onPresetChange(preset);
  }, [caption, onCaptionChange, onPresetChange]);

  const handleFontStyleToggle = useCallback(() => {
    const newCaption = {
      ...caption,
      style: {
        ...caption.style,
        fontStyle: caption.style.fontStyle === 'italic' ? 'normal' as const : 'italic' as const,
      },
    };
    onCaptionChange(newCaption);
  }, [caption, onCaptionChange]);

  const handlePositionChange = useCallback((field: 'x' | 'y', value: number) => {
    const newCaption = {
      ...caption,
      position: {
        ...caption.position,
        [field]: Math.max(0, Math.min(100, value)),
      },
    };
    onCaptionChange(newCaption);
  }, [caption, onCaptionChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(44, textarea.scrollHeight)}px`;
    }
  }, [caption.text]);

  return (
    <div className={`caption-input ${className}`}>
      <div className="caption-input__main">
        <div className="caption-input__text-section">
          <label htmlFor="caption-text" className="caption-input__label">
            💬 Caption Text
          </label>
          <textarea
            ref={textareaRef}
            id="caption-text"
            value={caption.text}
            onChange={handleTextChange}
            placeholder="Enter your vintage movie caption..."
            className="caption-input__textarea"
            maxLength={200}
            rows={2}
          />
          <div className="caption-input__text-info">
            <span className="caption-input__char-count">
              {caption.text.length}/200
            </span>
          </div>
        </div>

        <div className="caption-input__presets">
          <label className="caption-input__label">🎨 Style Presets</label>
          <div className="caption-input__preset-grid">
            {CAPTION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className="caption-input__preset-btn"
                style={{
                  background: `linear-gradient(45deg, ${preset.style.color}, ${preset.style.strokeColor})`,
                }}
              >
                <span className="caption-input__preset-name">{preset.name}</span>
                <span className="caption-input__preset-desc">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>

       
        <div className="caption-input__advanced">
          <div className="caption-input__row">
            <div className="caption-input__field">
              <label className="caption-input__label">Font Style</label>
              <button
                onClick={handleFontStyleToggle}
                className={`caption-input__toggle-btn ${
                  caption.style.fontStyle === 'italic' ? 'active' : ''
                }`}
              >
                <em>Italic</em>
              </button>
            </div>
            
            <div className="caption-input__field">
              <label className="caption-input__label">
                Position: {caption.position.y}%
              </label>
              <input
                type="range"
                min="10"
                max="98"
                value={caption.position.y}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                className="caption-input__slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
