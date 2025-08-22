import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ImageCrop } from '../ImageCrop';

// Mock react-easy-crop
vi.mock('react-easy-crop', () => {
  return {
    __esModule: true,
    default: ({ onCropComplete, ...props }: any) => {
      // Simulate crop completion after render
      React.useEffect(() => {
        if (onCropComplete) {
          const mockCroppedArea = { x: 0, y: 0, width: 100, height: 100 };
          const mockCroppedAreaPixels = { x: 10, y: 10, width: 200, height: 200 };
          onCropComplete(mockCroppedArea, mockCroppedAreaPixels);
        }
      }, [onCropComplete]);

      return (
        <div data-testid="react-easy-crop">
          <img src={props.image} alt="Crop preview" />
        </div>
      );
    },
  };
});

describe('ImageCrop', () => {
  const mockOnCropComplete = vi.fn();
  const mockOnCancel = vi.fn();
  const mockImageSrc = 'data:image/png;base64,test';

  const defaultProps = {
    imageSrc: mockImageSrc,
    onCropComplete: mockOnCropComplete,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders crop interface', () => {
    render(<ImageCrop {...defaultProps} />);
    
    expect(screen.getByTestId('react-easy-crop')).toBeInTheDocument();
    expect(screen.getByText(/Zoom:/)).toBeInTheDocument();
    expect(screen.getByText(/Rotation:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply crop/i })).toBeInTheDocument();
  });

  it('displays zoom and rotation controls', () => {
    render(<ImageCrop {...defaultProps} />);
    
    const zoomSlider = screen.getByDisplayValue('1'); // Default zoom
    const rotationSlider = screen.getByDisplayValue('0'); // Default rotation
    
    expect(zoomSlider).toBeInTheDocument();
    expect(rotationSlider).toBeInTheDocument();
  });

  it('updates zoom percentage display', async () => {
    const user = userEvent.setup();
    render(<ImageCrop {...defaultProps} />);
    
    const zoomSlider = screen.getByDisplayValue('1');
    
    // For range inputs, we need to use fireEvent.change
    fireEvent.change(zoomSlider, { target: { value: '2' } });
    
    expect(screen.getByText('Zoom: 200%')).toBeInTheDocument();
  });

  it('updates rotation degree display', async () => {
    render(<ImageCrop {...defaultProps} />);
    
    const rotationSlider = screen.getByDisplayValue('0');
    
    // For range inputs, we need to use fireEvent.change
    fireEvent.change(rotationSlider, { target: { value: '90' } });
    
    expect(screen.getByText('Rotation: 90°')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageCrop {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCropComplete when apply crop button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageCrop {...defaultProps} />);
    
    const applyCropButton = screen.getByRole('button', { name: /apply crop/i });
    await user.click(applyCropButton);
    
    expect(mockOnCropComplete).toHaveBeenCalledWith({
      x: 10,
      y: 10,
      width: 200,
      height: 200,
    });
  });

  it('resets controls when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageCrop {...defaultProps} />);
    
    // Change some values first
    const zoomSlider = screen.getByDisplayValue('1');
    const rotationSlider = screen.getByDisplayValue('0');
    
    fireEvent.change(zoomSlider, { target: { value: '2' } });
    fireEvent.change(rotationSlider, { target: { value: '45' } });
    
    // Verify changes
    expect(screen.getByText('Zoom: 200%')).toBeInTheDocument();
    expect(screen.getByText('Rotation: 45°')).toBeInTheDocument();
    
    // Reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
    expect(screen.getByText('Rotation: 0°')).toBeInTheDocument();
  });

  it('shows crop dimensions', () => {
    render(<ImageCrop {...defaultProps} />);
    
    // Should show dimensions from mocked crop complete
    expect(screen.getByText('200 × 200')).toBeInTheDocument();
  });

  it('prevents crop if minimum size not met', async () => {
    const user = userEvent.setup();
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ImageCrop {...defaultProps} minCropSize={300} />); // Higher than mocked 200x200
    
    const applyCropButton = screen.getByRole('button', { name: /apply crop/i });
    await user.click(applyCropButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Minimum crop size is 300x300 pixels');
    expect(mockOnCropComplete).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('applies custom className', () => {
    render(<ImageCrop {...defaultProps} className="custom-class" />);
    
    const container = screen.getByTestId('react-easy-crop').closest('.image-crop');
    expect(container).toHaveClass('custom-class');
  });
});
