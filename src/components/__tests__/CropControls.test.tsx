import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CropControls } from '../CropControls';
import { ASPECT_RATIOS } from '../../types/image';

describe('CropControls', () => {
  const mockOnAspectRatioChange = vi.fn();
  const mockOnStartCrop = vi.fn();

  const defaultProps = {
    selectedAspectRatio: ASPECT_RATIOS[0], // 'Free'
    onAspectRatioChange: mockOnAspectRatioChange,
    onStartCrop: mockOnStartCrop,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders crop controls interface', () => {
    render(<CropControls {...defaultProps} />);
    
    expect(screen.getByText('Crop Settings')).toBeInTheDocument();
    expect(screen.getByText('Aspect Ratio:')).toBeInTheDocument();
    expect(screen.getByText('🖼️ Start Cropping')).toBeInTheDocument();
  });

  it('displays all aspect ratio options', () => {
    render(<CropControls {...defaultProps} />);
    
    // Check that all aspect ratio buttons are present
    ASPECT_RATIOS.forEach((ratio) => {
      const button = screen.getByRole('button', { 
        name: new RegExp(ratio.label, 'i') 
      });
      expect(button).toBeInTheDocument();
    });
  });

  it('highlights selected aspect ratio', () => {
    const selectedRatio = ASPECT_RATIOS[1]; // 'Square'
    render(
      <CropControls 
        {...defaultProps} 
        selectedAspectRatio={selectedRatio}
      />
    );
    
    const squareButton = screen.getByRole('button', { name: /square/i });
    expect(squareButton).toHaveClass('crop-controls__ratio-btn--active');
  });

  it('calls onAspectRatioChange when ratio button is clicked', async () => {
    const user = userEvent.setup();
    render(<CropControls {...defaultProps} />);
    
    const squareButton = screen.getByRole('button', { name: /square/i });
    await user.click(squareButton);
    
    expect(mockOnAspectRatioChange).toHaveBeenCalledWith(ASPECT_RATIOS[1]);
  });

  it('calls onStartCrop when start cropping button is clicked', async () => {
    const user = userEvent.setup();
    render(<CropControls {...defaultProps} />);
    
    const startButton = screen.getByRole('button', { name: /start cropping/i });
    await user.click(startButton);
    
    expect(mockOnStartCrop).toHaveBeenCalled();
  });

  it('renders all required elements', () => {
    render(<CropControls {...defaultProps} />);
    
    // Check that start cropping button exists
    expect(screen.getByRole('button', { name: /start cropping/i })).toBeInTheDocument();
    
    // Check that aspect ratio grid exists
    expect(screen.getByText('Aspect Ratio:')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CropControls {...defaultProps} className="custom-class" />);
    
    const container = screen.getByText('Crop Settings').closest('.crop-controls');
    expect(container).toHaveClass('custom-class');
  });
});
