/**
 * Utility functions for applying vintage film filter effects to canvas
 */

import { VintageMode } from '../types/image';

/**
 * Main function to apply vintage effects based on selected mode
 */
export function applyVintageEffect(ctx: CanvasRenderingContext2D, width: number, height: number, mode: VintageMode): void {
  switch (mode) {
    case VintageMode.Off:
      // No effects applied
      break;
    case VintageMode.Classic:
      applyClassicEffect(ctx, width, height);
      break;
    case VintageMode.Faded:
      applyFadedEffect(ctx, width, height);
      break;
    case VintageMode.Warm:
      applyWarmEffect(ctx, width, height);
      break;
    case VintageMode.BlackWhite:
      applyBlackWhiteEffect(ctx, width, height);
      break;
  }
}

/**
 * Classic vintage film effect - proper film color characteristics
 * Based on VSCO research: "Blues often turn a bit more cyan, greens cool off 
 * and become more striking against warm tones that are gently nudged towards reds and oranges"
 */
function applyClassicEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Add film grain first
    const noise = (Math.random() - 0.5) * 25;
    let r = Math.max(0, Math.min(255, data[i] + noise));
    let g = Math.max(0, Math.min(255, data[i + 1] + noise)); 
    let b = Math.max(0, Math.min(255, data[i + 2] + noise));
    
    // Apply classic film color characteristics (much more subtle):
    
    // 1. Very subtle push of blues toward cyan
    const blueness = b / 255;
    const cyanShift = blueness * 0.06; // Reduced from 15% to 6%
    g = Math.min(255, g + cyanShift * 15); // Reduced from 40 to 15
    
    // 2. Gently cool off greens 
    const greenness = g / 255;
    b = Math.max(0, b - greenness * 8); // Reduced from 20 to 8
    g = Math.min(255, g * 1.02); // Reduced from 1.05 to 1.02
    
    // 3. Very subtle nudge of warm tones
    const warmth = Math.max(r - b, 0) / 255;
    r = Math.min(255, r + warmth * 6); // Reduced from 15 to 6
    g = Math.min(255, g + warmth * 3); // Reduced from 8 to 3
    
    // 4. Very gentle tonality - minimal S-curve
    r = appleSCurve(r, 0.05); // Reduced from 0.1 to 0.05
    g = appleSCurve(g, 0.05);
    b = appleSCurve(b, 0.05);
    
    // 5. Keep saturation natural
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const saturationLimit = 0.98; // Increased from 0.95 to 0.98 (less desaturation)
    r = gray + (r - gray) * saturationLimit;
    g = gray + (g - gray) * saturationLimit;
    b = gray + (b - gray) * saturationLimit;
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Faded vintage film effect - lifted shadows and reduced contrast
 * Uses proper tone curve adjustments instead of overlay tricks
 */
function applyFadedEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Get pixel data for tone curve manipulation
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Add grain noise first (like classic effect)
    const noise = (Math.random() - 0.5) * 25;
    
    let r = Math.max(0, Math.min(255, data[i] + noise));
    let g = Math.max(0, Math.min(255, data[i + 1] + noise)); 
    let b = Math.max(0, Math.min(255, data[i + 2] + noise));
    
    // Apply fade tone curve:
    // 1. Lift black point (add base level to shadows)
    const blackLift = 25; // Prevents pure black (0) from staying at 0
    r = Math.min(255, r + blackLift * (1 - r / 255)); // More lift in darker areas
    g = Math.min(255, g + blackLift * (1 - g / 255));
    b = Math.min(255, b + blackLift * (1 - b / 255));
    
    // 2. Reduce contrast by compressing dynamic range
    const contrastReduction = 0.85; // Compress toward middle gray (128)
    r = 128 + (r - 128) * contrastReduction;
    g = 128 + (g - 128) * contrastReduction;
    b = 128 + (b - 128) * contrastReduction;
    
    // 3. Slight desaturation for aged look
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const desaturation = 0.15;
    r = r + (gray - r) * desaturation;
    g = g + (gray - g) * desaturation;
    b = b + (gray - b) * desaturation;
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Add very subtle warm tint (optional)
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(139, 120, 93, 0.05)'; // Much lighter than classic
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Warm vintage film effect - enhanced sepia and orange tones
 * Based on VSCO: "film often turns reds kind of orange, especially with the Fuji Frontier scanner"
 * Simulates overexposed film characteristics with enhanced contrast and color
 */
function applyWarmEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Add film grain first
    const noise = (Math.random() - 0.5) * 25;
    let r = Math.max(0, Math.min(255, data[i] + noise));
    let g = Math.max(0, Math.min(255, data[i + 1] + noise)); 
    let b = Math.max(0, Math.min(255, data[i + 2] + noise));
    
    // Apply warm film characteristics:
    
    // 1. Turn reds toward orange (as mentioned in VSCO article)
    const redness = r / 255;
    g = Math.min(255, g + redness * 25); // Add yellow/orange to red areas
    
    // 2. Enhanced warm sepia tone mapping (not overlay)
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;
    const sepiaR = Math.min(255, luminance * 1.4);   // Warm highlight
    const sepiaG = Math.min(255, luminance * 1.2);   // Sepia midtone  
    const sepiaB = Math.min(255, luminance * 0.9);   // Cool shadows
    
    // Blend original with sepia (stronger than classic)
    const sepiaStrength = 0.4;
    r = r * (1 - sepiaStrength) + sepiaR * sepiaStrength;
    g = g * (1 - sepiaStrength) + sepiaG * sepiaStrength;
    b = b * (1 - sepiaStrength) + sepiaB * sepiaStrength;
    
    // 3. Overexposed film characteristics - more contrast and color
    r = appleSCurve(r, 0.2); // Stronger S-curve than classic
    g = appleSCurve(g, 0.2);
    b = appleSCurve(b, 0.2);
    
    // 4. Enhanced color saturation (overexposed film is more saturated)
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const saturationBoost = 1.15; // 15% more saturation
    r = gray + (r - gray) * saturationBoost;
    g = gray + (g - gray) * saturationBoost;
    b = gray + (b - gray) * saturationBoost;
    
    // 5. Warm color temperature shift
    r = Math.min(255, r * 1.05); // Boost reds slightly
    b = Math.max(0, b * 0.95);   // Reduce blues slightly
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Black and white vintage film effect - colorless grain and classic B&W characteristics
 * Based on VSCO: Proper tonal separation and film-like contrast curves
 */
function applyBlackWhiteEffect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 1. Better B&W conversion - more film-like channel mixing
    // Classic B&W film was more sensitive to certain colors
    const gray = r * 0.25 + g * 0.65 + b * 0.1; // Green-heavy like orthochromatic film
    
    // 2. Add colorless grain noise (as specifically requested)
    const noise = (Math.random() - 0.5) * 25;
    let bwValue = Math.max(0, Math.min(255, gray + noise));
    
    // 3. Classic B&W film tone curve - more dramatic than color film
    bwValue = appleSCurve(bwValue, 0.25); // Stronger S-curve for B&W
    
    // 4. Enhanced tonal separation (like zone system)
    // Brighten highlights, darken shadows slightly
    if (bwValue > 180) {
      bwValue = Math.min(255, bwValue * 1.1); // Brighter highlights
    } else if (bwValue < 75) {
      bwValue = Math.max(0, bwValue * 0.9);   // Deeper shadows
    }
    
    // 5. Film grain affects shadows more than highlights
    const shadowGrainBoost = (255 - bwValue) / 255 * 0.3;
    const extraGrain = (Math.random() - 0.5) * shadowGrainBoost * 20;
    bwValue = Math.max(0, Math.min(255, bwValue + extraGrain));
    
    // Set all channels to the same grayscale value (colorless)
    data[i] = bwValue;     // Red
    data[i + 1] = bwValue; // Green
    data[i + 2] = bwValue; // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Helper function to apply a subtle S-curve for film-like contrast
 * @param value - Input pixel value (0-255)
 * @param strength - Curve strength (0-1, where 0 = no curve, 1 = dramatic)
 * @returns Curved value (0-255)
 */
function appleSCurve(value: number, strength: number): number {
  // Normalize to 0-1 range
  const normalized = value / 255;
  
  // Apply S-curve: shadows pulled down, highlights pushed up
  // Formula: 3x² - 2x³ (smoothstep function)
  const curve = normalized * normalized * (3 - 2 * normalized);
  
  // Blend original with curved value based on strength
  const result = normalized * (1 - strength) + curve * strength;
  
  // Convert back to 0-255
  return result * 255;
}

