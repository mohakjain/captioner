import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useImageState } from '../useImageState';

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-url'),
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
});

// Mock Image constructor
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 800;
  naturalHeight = 600;

  set src(value: string) {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

(globalThis as any).Image = MockImage;

describe('useImageState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useImageState());

    expect(result.current.currentImage).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set image successfully', async () => {
    const { result } = renderHook(() => useImageState());
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.setImage(mockFile);
    });

    expect(result.current.currentImage).not.toBeNull();
    expect(result.current.currentImage?.file).toBe(mockFile);
    expect(result.current.currentImage?.name).toBe('test.jpg');
    expect(result.current.currentImage?.url).toBe('mock-url');
    expect(result.current.currentImage?.dimensions).toEqual({ width: 800, height: 600 });
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should clear image and revoke URL', async () => {
    const { result } = renderHook(() => useImageState());
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // First set an image
    await act(async () => {
      await result.current.setImage(mockFile);
    });

    // Then clear it
    act(() => {
      result.current.clearImage();
    });

    expect(result.current.currentImage).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('should clear error', async () => {
    // Mock Image to simulate error first
    class ErrorMockImage extends MockImage {
      set src(value: string) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror();
          }
        }, 0);
      }
    }
    (globalThis as any).Image = ErrorMockImage;

    const { result } = renderHook(() => useImageState());
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Try to set image to create an error
    await act(async () => {
      await result.current.setImage(mockFile);
    });

    // Verify error exists
    expect(result.current.error).toBe('Failed to load image dimensions');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();

    // Restore original MockImage
    (globalThis as any).Image = MockImage;
  });

  it('should handle image loading error', async () => {
    // Override MockImage to simulate error
    class ErrorMockImage extends MockImage {
      set src(value: string) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror();
          }
        }, 0);
      }
    }
    (globalThis as any).Image = ErrorMockImage;

    const { result } = renderHook(() => useImageState());
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.setImage(mockFile);
    });

    expect(result.current.currentImage).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBe('Failed to load image dimensions');

    // Restore original MockImage
    (globalThis as any).Image = MockImage;
  });
});
