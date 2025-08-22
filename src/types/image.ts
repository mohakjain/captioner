export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CroppedImageData {
  canvas: HTMLCanvasElement;
  blob: Blob;
  url: string;
  dimensions: ImageDimensions;
}

// Import Caption from caption types  
import { Caption } from './caption';

export interface ImageData {
  file: File;
  url: string;
  name: string;
  size: number;
  dimensions?: ImageDimensions;
  croppedImage?: CroppedImageData;
  captions?: Caption[];
}

export interface ImageState {
  currentImage: ImageData | null;
  isProcessing: boolean;
  isCropping: boolean;
  isCaptioning: boolean;
  error: string | null;
}

// Aspect ratio presets
export interface AspectRatio {
  label: string;
  value: number | null; // null means free form
  displayRatio?: string;
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: 'Free', value: null, displayRatio: 'Free' },
  { label: 'Square', value: 1, displayRatio: '1:1' },
  { label: 'Photo', value: 4/3, displayRatio: '4:3' },
  { label: 'Landscape', value: 16/9, displayRatio: '16:9' },
  { label: 'Portrait', value: 3/4, displayRatio: '3:4' },
  { label: 'Story', value: 9/16, displayRatio: '9:16' },
  { label: 'Wide', value: 3/2, displayRatio: '3:2' },
];
