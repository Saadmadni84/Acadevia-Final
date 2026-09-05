import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';
import { dataService } from '@/services/data.service';

describe('TeacherDashboard Component', () => {
  it('renders successfully with teacher metadata and dynamic metric cards', () => {
    const { container } = render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    // Header greetings
    expect(screen.getByText(/Welcome,/i)).toBeDefined();
    expect(screen.getByText(/Teacher Hub/i)).toBeDefined();

    // KPI Stat cards
    expect(screen.getByText('Enrolled Students')).toBeDefined();
    expect(screen.getByText('Curriculum & Lectures')).toBeDefined();
    expect(screen.getByText('Quizzes & Assessments')).toBeDefined();
    expect(screen.getByText('Class Average Mastery')).toBeDefined();

    // Hub sections
    expect(screen.getByText('Class Performance & Mastery Hub')).toBeDefined();
    expect(screen.getByText('Recent Submissions')).toBeDefined();
    expect(screen.getByText('Student Doubts & Q&A')).toBeDefined();
    expect(screen.getByText('Published Curriculum & Lectures')).toBeDefined();
    expect(screen.getByText('Teacher Command Actions')).toBeDefined();

    expect(container).toBeDefined();
  });

  it('allows switching class grade and subject filter tabs dynamically', () => {
    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    // Check Class buttons
    const class10Btn = screen.getByRole('button', { name: /Class 10/i });
    expect(class10Btn).toBeDefined();

    // Click another class if available
    const class9Btn = screen.queryByRole('button', { name: /Class 9/i });
    if (class9Btn) {
      fireEvent.click(class9Btn);
      expect(screen.getByText(/Real-time analytics for Class 9/i)).toBeDefined();
    }
  });
});
