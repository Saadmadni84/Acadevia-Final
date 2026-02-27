import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoPlayer from '@/components/VideoPlayer';

const mockVideoProps = {
  src: 'https://cdn.acadevia.in/videos/lesson-1.mp4',
  title: 'Introduction to Variables',
  qualities: ['360p', '480p', '720p', '1080p'],
  onProgress: vi.fn(),
  onComplete: vi.fn(),
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video player container', () => {
    const { container } = render(<VideoPlayer {...mockVideoProps} />);

    const videoContainer = container.querySelector(
      '[class*="player"], [class*="video"], video'
    );
    expect(videoContainer).toBeInTheDocument();
  });

  it('shows custom controls', () => {
    render(<VideoPlayer {...mockVideoProps} />);

    expect(
      screen.getByRole('button', { name: /play|pause/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /fullscreen|expand/i }) ||
        screen.getByLabelText(/fullscreen/i)
    ).toBeTruthy();
    expect(
      screen.getByRole('slider') || screen.getByLabelText(/volume|progress/i)
    ).toBeTruthy();
  });

  it('play/pause button toggles', () => {
    render(<VideoPlayer {...mockVideoProps} />);

    const playPauseBtn = screen.getByRole('button', { name: /play|pause/i });

    expect(playPauseBtn).toHaveAccessibleName(/play/i);

    fireEvent.click(playPauseBtn);
    expect(playPauseBtn).toHaveAccessibleName(/pause/i);

    fireEvent.click(playPauseBtn);
    expect(playPauseBtn).toHaveAccessibleName(/play/i);
  });

  it('quality selector renders options', () => {
    render(<VideoPlayer {...mockVideoProps} />);

    const qualitySelector =
      screen.getByRole('button', { name: /quality|720p|1080p/i }) ||
      screen.getByLabelText(/quality/i);
    expect(qualitySelector).toBeInTheDocument();

    fireEvent.click(qualitySelector);

    mockVideoProps.qualities.forEach((quality) => {
      expect(screen.getByText(quality)).toBeInTheDocument();
    });
  });
});
