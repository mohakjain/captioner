export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  lineHeight: number;
}

export interface CaptionPosition {
  x: number; // percentage of image width (0-100)
  y: number; // percentage of image height (0-100)
  alignment: 'left' | 'center' | 'right';
}

export interface Caption {
  id: string;
  text: string;
  style: CaptionStyle;
  position: CaptionPosition;
}

export interface CaptionPreset {
  name: string;
  description: string;
  style: CaptionStyle;
  defaultPosition: CaptionPosition;
}

// Vintage movie subtitle preset
export const VINTAGE_MOVIE_PRESET: CaptionPreset = {
  name: 'Classic Movie',
  description: 'Light yellow text with black outline',
  style: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 32,
    fontStyle: 'italic',
    color: '#FFEB3B', // Light yellow
    strokeColor: '#000000', // Black outline
    strokeWidth: 3,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    lineHeight: 1.4,
  },
  defaultPosition: {
    x: 50, // Center horizontally
    y: 75, // Bottom third (75% down from top)
    alignment: 'center',
  },
};

// Additional color presets mentioned in TODO
export const CAPTION_PRESETS: CaptionPreset[] = [
  VINTAGE_MOVIE_PRESET,
  {
    name: 'Purple Dream',
    description: 'Light purple with black outline',
    style: {
      ...VINTAGE_MOVIE_PRESET.style,
      color: '#E1BEE7', // Light purple
    },
    defaultPosition: VINTAGE_MOVIE_PRESET.defaultPosition,
  },
  {
    name: 'Classic White',
    description: 'White text with black outline',
    style: {
      ...VINTAGE_MOVIE_PRESET.style,
      color: '#FFFFFF', // White
    },
    defaultPosition: VINTAGE_MOVIE_PRESET.defaultPosition,
  },
];
