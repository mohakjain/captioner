import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ImageUpload } from '../ImageUpload';

describe('ImageUpload', () => {
  const mockOnImageSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload interface', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop an image here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports: JPG, PNG, WebP, HEIC (max 10MB)')).toBeInTheDocument();
  });

  it('shows processing state', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} isProcessing={true} />);
    
    expect(screen.getByText('Processing image...')).toBeInTheDocument();
    expect(screen.queryByText('Upload Image')).not.toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMessage = 'Test error message';
    render(<ImageUpload onImageSelect={mockOnImageSelect} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    const user = userEvent.setup();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('Upload image').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('handles click to open file dialog', async () => {
    const user = userEvent.setup();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    const dropzone = screen.getByRole('button', { name: 'Upload image' });
    
    // Mock click event on the hidden input
    const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    
    await user.click(dropzone);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    const dropzone = screen.getByRole('button', { name: 'Upload image' });
    const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    
    // Focus and press Enter
    dropzone.focus();
    await user.keyboard('{Enter}');
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles drag and drop', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />);
    
    const dropzone = screen.getByRole('button', { name: 'Upload image' });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Simulate drag enter
    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [file] }
    });
    
    expect(dropzone).toHaveClass('image-upload__dropzone--active');
    
    // Simulate drop
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] }
    });
    
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('prevents interaction when processing', async () => {
    const user = userEvent.setup();
    render(<ImageUpload onImageSelect={mockOnImageSelect} isProcessing={true} />);
    
    const dropzone = screen.getByRole('button', { name: 'Upload image' });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Try to drop file while processing
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] }
    });
    
    expect(mockOnImageSelect).not.toHaveBeenCalled();
    
    // Try to click while processing
    await user.click(dropzone);
    
    const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} className="custom-class" />);
    
    const container = screen.getByRole('button', { name: 'Upload image' }).closest('.image-upload');
    expect(container).toHaveClass('custom-class');
  });
});
