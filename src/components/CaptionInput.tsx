import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Caption, CaptionPreset, CAPTION_PRESETS } from '../types/caption';
import { VintageMode } from '../types/image';
import '../theme.css';

interface CaptionInputProps {
  caption: Caption;
  onCaptionChange: (caption: Caption) => void;
  onPresetChange: (preset: CaptionPreset) => void;
  vintageMode: VintageMode;
  onVintageModeChange: (mode: VintageMode) => void;
  className?: string;
}

export const CaptionInput: React.FC<CaptionInputProps> = ({
  caption,
  onCaptionChange,
  onPresetChange,
  vintageMode,
  onVintageModeChange,
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

  const handleFontSizeChange = useCallback((value: number) => {
    const newCaption = {
      ...caption,
      style: {
        ...caption.style,
        fontSize: Math.max(1, Math.min(10, value)), // 1% to 10% of image width
      },
    };
    onCaptionChange(newCaption);
  }, [caption, onCaptionChange]);

  const handleVintageModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onVintageModeChange(e.target.value as VintageMode);
  }, [onVintageModeChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(44, textarea.scrollHeight)}px`;
    }
  }, [caption.text]);

  return (
    <div className={`theme-card ${className}`} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="theme-flex-col theme-gap-xl">
        {/* Text Input Section */}
        <div className="theme-flex-col theme-gap-sm">
          <label htmlFor="caption-text" className="theme-label">
            Caption
          </label>
          <textarea
            ref={textareaRef}
            id="caption-text"
            value={caption.text}
            onChange={handleTextChange}
            placeholder="Enter your caption"
            className="theme-input"
            maxLength={200}
            rows={2}
            style={{ 
              minHeight: '44px',
              resize: 'none',
              height: 'auto'
            }}
          />

        </div>

        {/* Preset Styles */}
        <div className="theme-flex-col theme-gap-md">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--spacing-md)'
          }}>
            {CAPTION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className="theme-button"
                style={{
                  background: `linear-gradient(45deg, ${preset.style.color}, ${preset.style.strokeColor})`,
                  color: 'white',
                  flexDirection: 'column',
                }}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vintage Mode Control */}
        <div style={{
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div className="theme-flex-col theme-gap-sm">
            <label htmlFor="vintage-mode" className="theme-label">
              📽️ Stylize
            </label>
            <select
              id="vintage-mode"
              value={vintageMode}
              onChange={handleVintageModeChange}
              className="theme-input"
              style={{
                padding: 'var(--spacing-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-base)',
              }}
            >
              <option value={VintageMode.Off}>Off</option>
              <option value={VintageMode.Classic}>Classic Film</option>
              <option value={VintageMode.Faded}>Faded Film</option>
              <option value={VintageMode.Warm}>Warm Film</option>
              <option value={VintageMode.BlackWhite}>Black & White</option>
            </select>
          </div>
        </div>

        {/* Advanced Controls */}
        <div style={{
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-xl)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div className="theme-grid-2">
            <div className="theme-flex-col theme-gap-sm">
              <button
                onClick={handleFontStyleToggle}
                className={`theme-button-secondary ${
                  caption.style.fontStyle === 'italic' ? 'active' : ''
                }`}
                style={caption.style.fontStyle === 'italic' ? {
                  borderColor: 'var(--color-focus)',
                  backgroundColor: '#dbeafe',
                  color: 'var(--color-focus)'
                } : {}}
              >
                <em>Italic</em>
              </button>
            </div>
            
            <div className="theme-flex-col theme-gap-sm">
              <label className="theme-label">
                Font Size: {caption.style.fontSize.toFixed(1)}%
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={caption.style.fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--color-gray-200)',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
          
          <div className="theme-flex-col theme-gap-sm" style={{ marginTop: 'var(--spacing-lg)' }}>
            <label className="theme-label">
              Position: {caption.position.y}%
            </label>
            <input
              type="range"
              min="10"
              max="98"
              value={caption.position.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--color-gray-200)',
                outline: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
