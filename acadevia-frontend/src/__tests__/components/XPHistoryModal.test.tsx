import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { XPHistoryModal } from '../../components/dashboard/XPHistoryModal';

describe('XPHistoryModal Close Behavior and Dynamic Progression', () => {
  it('does not render when isOpen is false|', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={false} onClose={handleClose} currentXP={0} />
      </MemoryRouter>
    );

    expect(screen.queryByText('XP & Progression History')).not.toBeInTheDocument();
  });

  it('renders modal with correct default 0 XP values when isOpen is true', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={true} onClose={handleClose} currentXP={0} />
      </MemoryRouter>
    );

    expect(screen.getByText('XP & Progression History')).toBeInTheDocument();
    expect(screen.getByText('LEVEL 01')).toBeInTheDocument();
    expect(screen.getByText('Newcomer')).toBeInTheDocument();
    expect(screen.getByText('100 XP to Level 2')).toBeInTheDocument();
    expect(screen.getByText('No XP activity yet')).toBeInTheDocument();
  });

  it('calls onClose when clicking the top-right X button', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={true} onClose={handleClose} currentXP={0} />
      </MemoryRouter>
    );

    const closeIconButton = screen.getByLabelText('Close');
    expect(closeIconButton).toBeInTheDocument();
    fireEvent.click(closeIconButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the bottom Close button', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={true} onClose={handleClose} currentXP={0} />
      </MemoryRouter>
    );

    const bottomCloseButton = screen.getByText('Close', { selector: 'button' });
    expect(bottomCloseButton).toBeInTheDocument();
    fireEvent.click(bottomCloseButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing the Escape key', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={true} onClose={handleClose} currentXP={0} />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders Level 05 Achiever with 720 XP matching user specification', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <XPHistoryModal isOpen={true} onClose={handleClose} currentXP={720} />
      </MemoryRouter>
    );

    expect(screen.getByText('LEVEL 05')).toBeInTheDocument();
    expect(screen.getByText('Achiever')).toBeInTheDocument();
    expect(screen.getByText('280 XP to Level 6')).toBeInTheDocument();
  });
});
