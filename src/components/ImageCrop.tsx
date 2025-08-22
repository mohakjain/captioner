import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { CropData } from '../types/image';
import './ImageCrop.css';

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropProps {
  imageSrc: string;
  onCropComplete: (cropData: CropData) => void;
  onCancel: () => void;
  aspectRatio?: number | null;
  minCropSize?: number;
  className?: string;
}

export const ImageCrop: React.FC<ImageCropProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = null,
  minCropSize = 200,
  className = '',
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = useCallback(() => {
    if (!croppedAreaPixels) return;

    // Check minimum size requirement
    if (croppedAreaPixels.width < minCropSize || croppedAreaPixels.height < minCropSize) {
      alert(`Minimum crop size is ${minCropSize}x${minCropSize} pixels`);
      return;
    }

    const cropData: CropData = {
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    };

    onCropComplete(cropData);
  }, [croppedAreaPixels, minCropSize, onCropComplete]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  return (
    <div className={`image-crop ${className}`}>
      <div className="image-crop__container">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio || undefined}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          onCropComplete={onCropCompleteHandler}
          showGrid={true}
          cropShape="rect"
          style={{
            containerStyle: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        />
      </div>

      <div className="image-crop__controls">
        <div className="image-crop__control-group">
          <label className="image-crop__label">
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="image-crop__slider"
          />
        </div>

        <div className="image-crop__control-group">
          <label className="image-crop__label">
            Rotation: {rotation}°
          </label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="image-crop__slider"
          />
        </div>

        <div className="image-crop__actions">
          <button
            onClick={handleReset}
            className="image-crop__button image-crop__button--secondary"
            type="button"
          >
            Reset
          </button>
          
          <button
            onClick={onCancel}
            className="image-crop__button image-crop__button--secondary"
            type="button"
          >
            Cancel
          </button>
          
          <button
            onClick={handleApplyCrop}
            className="image-crop__button image-crop__button--primary"
            type="button"
            disabled={!croppedAreaPixels}
          >
            Apply Crop
          </button>
        </div>

        {croppedAreaPixels && (
          <div className="image-crop__info">
            <span className="image-crop__dimensions">
              {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
