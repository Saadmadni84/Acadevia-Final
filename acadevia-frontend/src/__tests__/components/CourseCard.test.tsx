import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourseCard from '@/components/CourseCard';

const enrolledCourse = {
  id: 'course-1',
  title: 'Introduction to React',
  teacher: 'Dr. Sarah Chen',
  rating: 4.7,
  progress: 65,
  enrolled: true,
  thumbnail: '/assets/courses/react.png',
};

const unenrolledCourse = {
  id: 'course-2',
  title: 'Advanced TypeScript',
  teacher: 'Prof. James Lee',
  rating: 4.9,
  progress: 0,
  enrolled: false,
  thumbnail: '/assets/courses/typescript.png',
};

describe('CourseCard', () => {
  it('renders course title, teacher, and rating', () => {
    render(<CourseCard course={enrolledCourse} />);

    expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Sarah Chen/)).toBeInTheDocument();
    expect(screen.getByText(/4\.7/)).toBeInTheDocument();
  });

  it('shows progress bar for enrolled courses', () => {
    render(<CourseCard course={enrolledCourse} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('shows "Enroll" button for unenrolled courses', () => {
    render(<CourseCard course={unenrolledCourse} />);

    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    expect(enrollButton).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const onEnroll = vi.fn();

    render(<CourseCard course={unenrolledCourse} onClick={onClick} onEnroll={onEnroll} />);

    fireEvent.click(screen.getByText('Advanced TypeScript'));
    expect(onClick).toHaveBeenCalledWith(unenrolledCourse.id);

    fireEvent.click(screen.getByRole('button', { name: /enroll/i }));
    expect(onEnroll).toHaveBeenCalledWith(unenrolledCourse.id);
  });
});
