import { useMemo } from 'react';
import { Caption } from '../types/caption';

// Hook to create stable caption objects that only change when meaningful values change
export const useStableCaption = (caption: Caption): Caption => {
  return useMemo(() => ({
    id: caption.id,
    text: caption.text,
    style: {
      fontFamily: caption.style.fontFamily,
      fontSize: caption.style.fontSize,
      fontStyle: caption.style.fontStyle,
      color: caption.style.color,
      strokeColor: caption.style.strokeColor,
      strokeWidth: caption.style.strokeWidth,
      shadowColor: caption.style.shadowColor,
      shadowBlur: caption.style.shadowBlur,
      shadowOffsetX: caption.style.shadowOffsetX,
      shadowOffsetY: caption.style.shadowOffsetY,
      lineHeight: caption.style.lineHeight,
    },
    position: {
      x: caption.position.x,
      y: caption.position.y,
      alignment: caption.position.alignment,
    },
  }), [
    caption.id,
    caption.text,
    caption.style.fontFamily,
    caption.style.fontSize,
    caption.style.fontStyle,
    caption.style.color,
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
  ]);
};
