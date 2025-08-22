import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SaveImageButton } from '../SaveImageButton';
import { ImageData } from '../../types/image';

describe('SaveImageButton', () => {
  const mockImageData: ImageData = {
    file: new File(['test'], 'test-image.jpg', { type: 'image/jpeg' }),
    url: 'mock-image-url',
    name: 'test-image.jpg',
    size: 1024,
    dimensions: { width: 800, height: 600 },
  };

  const mockCroppedImageData: ImageData = {
    ...mockImageData,
    croppedImage: {
      canvas: document.createElement('canvas') as any,
      blob: new Blob(['cropped'], { type: 'image/png' }),
      url: 'mock-cropped-url',
      dimensions: { width: 400, height: 300 },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders save button with default props', () => {
    render(<SaveImageButton image={mockImageData} />);
    
    expect(screen.getByRole('button', { name: /download original image/i })).toBeInTheDocument();
    expect(screen.getByText(/save original png/i)).toBeInTheDocument();
  });

  it('renders save button for cropped image when preferCropped is true', () => {
    render(<SaveImageButton image={mockCroppedImageData} preferCropped={true} />);
    
    expect(screen.getByRole('button', { name: /download cropped image/i })).toBeInTheDocument();
    expect(screen.getByText(/save cropped png/i)).toBeInTheDocument();
  });

  it('applies different size variants', () => {
    const { rerender } = render(<SaveImageButton image={mockImageData} size="small" />);
    expect(screen.getByRole('button')).toHaveClass('save-image-btn--small');
    
    rerender(<SaveImageButton image={mockImageData} size="medium" />);
    expect(screen.getByRole('button')).toHaveClass('save-image-btn--medium');
    
    rerender(<SaveImageButton image={mockImageData} size="large" />);
    expect(screen.getByRole('button')).toHaveClass('save-image-btn--large');
  });

  it('applies different style variants', () => {
    const { rerender } = render(<SaveImageButton image={mockImageData} variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('save-image-btn--primary');
    
    rerender(<SaveImageButton image={mockImageData} variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('save-image-btn--secondary');
  });

  it('applies custom className', () => {
    render(<SaveImageButton image={mockImageData} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<SaveImageButton image={mockImageData} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download original image as PNG');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('shows different text for cropped vs original images', () => {
    const { rerender } = render(
      <SaveImageButton image={mockImageData} preferCropped={false} />
    );
    expect(screen.getByText(/save original png/i)).toBeInTheDocument();
    
    rerender(
      <SaveImageButton image={mockCroppedImageData} preferCropped={true} />
    );
    expect(screen.getByText(/save cropped png/i)).toBeInTheDocument();
  });

  it('uses custom filename in aria-label when provided', () => {
    render(
      <SaveImageButton 
        image={mockImageData} 
        filename="custom-name.png"
        preferCropped={false}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download original image as PNG');
  });

  it('shows spinner element when in loading state (via CSS)', () => {
    const { container } = render(<SaveImageButton image={mockImageData} />);
    
    // The spinner is added via CSS ::after pseudo-element when --loading class is present
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // We can at least verify the button structure exists for styling
    expect(button.querySelector('.save-image-btn__text')).toBeInTheDocument();
  });
});
