import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CaptionInput } from '../CaptionInput';
import { VINTAGE_MOVIE_PRESET, CAPTION_PRESETS } from '../../types/caption';

describe('CaptionInput', () => {
  const mockCaption = {
    id: 'test-caption',
    text: 'Test caption text',
    style: VINTAGE_MOVIE_PRESET.style,
    position: VINTAGE_MOVIE_PRESET.defaultPosition,
  };

  const mockOnCaptionChange = vi.fn();
  const mockOnPresetChange = vi.fn();

  const defaultProps = {
    caption: mockCaption,
    onCaptionChange: mockOnCaptionChange,
    onPresetChange: mockOnPresetChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders caption input interface', () => {
    render(<CaptionInput {...defaultProps} />);
    
    expect(screen.getByLabelText(/caption text/i)).toBeInTheDocument();
    expect(screen.getByText(/style presets/i)).toBeInTheDocument();
    expect(screen.getByText(/show advanced/i)).toBeInTheDocument();
  });

  it('displays current caption text', () => {
    render(<CaptionInput {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('Test caption text');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onCaptionChange when text is modified', async () => {
    render(<CaptionInput {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/caption text/i);
    
    // Simulate text change directly
    fireEvent.change(textarea, { target: { value: 'New caption text' } });
    
    // Should have been called with the new text
    expect(mockOnCaptionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'New caption text'
      })
    );
  });

  it('shows character count', () => {
    render(<CaptionInput {...defaultProps} />);
    
    expect(screen.getByText('17/200')).toBeInTheDocument(); // "Test caption text" is 17 chars
  });

  it('displays all preset options', () => {
    render(<CaptionInput {...defaultProps} />);
    
    CAPTION_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
      expect(screen.getByText(preset.description)).toBeInTheDocument();
    });
  });

  it('calls onPresetChange when preset is selected', async () => {
    const user = userEvent.setup();
    render(<CaptionInput {...defaultProps} />);
    
    const purplePreset = screen.getByText('Purple Dream');
    await user.click(purplePreset);
    
    expect(mockOnCaptionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          color: '#E1BEE7' // Purple Dream color
        })
      })
    );
    expect(mockOnPresetChange).toHaveBeenCalled();
  });

  it('toggles advanced controls', async () => {
    const user = userEvent.setup();
    render(<CaptionInput {...defaultProps} />);
    
    // Advanced controls should be hidden initially
    expect(screen.queryByText('Font Style')).not.toBeInTheDocument();
    
    // Show advanced controls
    const toggleButton = screen.getByText(/show advanced/i);
    await user.click(toggleButton);
    
    expect(screen.getByText('Font Style')).toBeInTheDocument();
    expect(screen.getByText('Alignment')).toBeInTheDocument();
    expect(screen.getByText(/horizontal position/i)).toBeInTheDocument();
    expect(screen.getByText(/vertical position/i)).toBeInTheDocument();
  });

  it('toggles font style', async () => {
    const user = userEvent.setup();
    render(<CaptionInput {...defaultProps} />);
    
    // Show advanced controls first
    await user.click(screen.getByText(/show advanced/i));
    
    const italicButton = screen.getByText('Italic');
    await user.click(italicButton);
    
    expect(mockOnCaptionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        style: expect.objectContaining({
          fontStyle: 'normal' // Should toggle from 'italic' to 'normal'
        })
      })
    );
  });

  it('updates position sliders', async () => {
    render(<CaptionInput {...defaultProps} />);
    
    // Show advanced controls first
    await fireEvent.click(screen.getByText(/show advanced/i));
    
    const horizontalSlider = screen.getByDisplayValue('50'); // Default horizontal position
    fireEvent.change(horizontalSlider, { target: { value: '25' } });
    
    expect(mockOnCaptionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({
          x: 25
        })
      })
    );
  });

  it('limits character input to 200 characters', async () => {
    const longText = 'a'.repeat(250); // 250 characters
    const user = userEvent.setup();
    render(<CaptionInput {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/caption text/i);
    await user.clear(textarea);
    await user.type(textarea, longText);
    
    // Should be limited to 200 characters
    expect(textarea).toHaveAttribute('maxLength', '200');
  });

  it('applies custom className', () => {
    render(<CaptionInput {...defaultProps} className="custom-class" />);
    
    const container = screen.getByLabelText(/caption text/i).closest('.caption-input');
    expect(container).toHaveClass('custom-class');
  });

  it('shows proper accessibility attributes', () => {
    render(<CaptionInput {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/caption text/i);
    expect(textarea).toHaveAttribute('id', 'caption-text');
    
    const label = screen.getByText('💬 Caption Text');
    expect(label).toHaveAttribute('for', 'caption-text');
  });
});
