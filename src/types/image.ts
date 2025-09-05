export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // Rotation in degrees
}

export interface CroppedImageData {
  canvas: HTMLCanvasElement;
  blob: Blob;
  url: string;
  dimensions: ImageDimensions;
}

// Import Caption from caption types  
import { Caption } from './caption';

export enum VintageMode {
  Off = 'off',
  Classic = 'classic',
  Faded = 'faded',
  Warm = 'warm',
  BlackWhite = 'blackwhite'
}

export interface ImageData {
  file: File;
  url: string;
  name: string;
  size: number;
  dimensions?: ImageDimensions;
  croppedImage?: CroppedImageData;
  captions?: Caption[];
  vintageMode?: VintageMode; // Vintage filter mode
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
  { label: 'Cinematic', value: 1.85, displayRatio: '1.85:1' },
];
