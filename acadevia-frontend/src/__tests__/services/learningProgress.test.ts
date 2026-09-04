import { describe, it, expect, beforeEach, vi } from 'vitest';
import { learningProgressService } from '@/services/learningProgress.service';
import { useAuthStore } from '@/stores/useAuthStore';

describe('Universal Learning Progress System (Continue Learning)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 20,
        username: 'gaurav.student',
        email: 'gaurav.student@acadevia.in',
        fullName: 'Gaurav Student',
        role: 'STUDENT',
        classGrade: 10,
        schoolName: 'Kendriya Vidyalaya No. 1',
        totalXP: 500,
        streakDays: 3,
        createdAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      token: 'mock-token',
    });
  });

  it('should save and retrieve learning progress across all core subjects and custom subjects', async () => {
    const subjects = [
      { subject: 'Mathematics', chapter: 'Real Numbers', contentId: 'vid-math-1', title: 'Euclid Division Lemma' },
      { subject: 'Science', chapter: 'Chemical Reactions', contentId: 'vid-sci-1', title: 'Types of Chemical Reactions' },
      { subject: 'English', chapter: 'A Letter to God', contentId: 'vid-eng-1', title: 'Lencho and the Storm' },
      { subject: 'Hindi', chapter: 'सूरदास के पद', contentId: 'vid-hin-1', title: 'पद १ - व्याख्या' },
      { subject: 'Social Science', chapter: 'Resources and Development', contentId: 'vid-soc-1', title: 'Classification of Soils' },
      { subject: 'Computer Science', chapter: 'Python Basics', contentId: 'vid-cs-1', title: 'Variables and Data Types' },
      { subject: 'Robotics & AI', chapter: 'Sensors', contentId: 'vid-custom-1', title: 'Ultrasonic Distance Sensors' },
    ];

    for (const item of subjects) {
      await learningProgressService.saveProgress({
        contentId: item.contentId,
        subject: item.subject,
        chapter: item.chapter,
        title: item.title,
        lastPositionSeconds: 120,
        durationSeconds: 300,
      });
    }

    const recent = await learningProgressService.getRecentProgress('20', 10);
    expect(recent.length).toBe(7);

    // Verify all subjects are present
    const savedSubjects = recent.map((r) => r.subject);
    expect(savedSubjects).toContain('Mathematics');
    expect(savedSubjects).toContain('Science');
    expect(savedSubjects).toContain('English');
    expect(savedSubjects).toContain('Hindi');
    expect(savedSubjects).toContain('Social Science');
    expect(savedSubjects).toContain('Computer Science');
    expect(savedSubjects).toContain('Robotics & AI');
  });

  it('should maintain independent progress records for multiple videos in the same chapter', async () => {
    // Video 1 in Chapter 1
    await learningProgressService.saveProgress({
      contentId: 'math-ch1-v1',
      subject: 'Mathematics',
      chapter: 'Real Numbers',
      title: 'Real Numbers: Part 1',
      lastPositionSeconds: 150,
      durationSeconds: 300,
    });

    // Video 2 in Chapter 1 (same subject and chapter, different video)
    await learningProgressService.saveProgress({
      contentId: 'math-ch1-v2',
      subject: 'Mathematics',
      chapter: 'Real Numbers',
      title: 'Real Numbers: Part 2',
      lastPositionSeconds: 60,
      durationSeconds: 600,
    });

    const recent = await learningProgressService.getRecentProgress('20');
    expect(recent.length).toBe(2);

    const v1 = await learningProgressService.getContentProgress('math-ch1-v1', '20');
    const v2 = await learningProgressService.getContentProgress('math-ch1-v2', '20');

    expect(v1).not.toBeNull();
    expect(v2).not.toBeNull();
    expect(v1?.lastPositionSeconds).toBe(150);
    expect(v1?.progressPercent).toBe(50); // 150 / 300
    expect(v2?.lastPositionSeconds).toBe(60);
    expect(v2?.progressPercent).toBe(10); // 60 / 600
  });

  it('should isolate progress strictly between multiple students', async () => {
    // Student 20 watches Science video to 40%
    await learningProgressService.saveProgress({
      studentId: '20',
      contentId: 'sci-video-101',
      subject: 'Science',
      chapter: 'Light',
      title: 'Reflection of Light',
      lastPositionSeconds: 200,
      durationSeconds: 500,
    });

    // Student 25 watches same Science video to 90%
    await learningProgressService.saveProgress({
      studentId: '25',
      contentId: 'sci-video-101',
      subject: 'Science',
      chapter: 'Light',
      title: 'Reflection of Light',
      lastPositionSeconds: 450,
      durationSeconds: 500,
    });

    const progStudent20 = await learningProgressService.getContentProgress('sci-video-101', '20');
    const progStudent25 = await learningProgressService.getContentProgress('sci-video-101', '25');

    expect(progStudent20?.progressPercent).toBe(40);
    expect(progStudent20?.completed).toBe(false);

    expect(progStudent25?.progressPercent).toBe(90);
    expect(progStudent25?.completed).toBe(true);
  });

  it('should sort recent progress by lastWatchedAt DESC', async () => {
    // Watch video A
    await learningProgressService.saveProgress({
      contentId: 'vid-a',
      subject: 'English',
      chapter: 'Grammar',
      title: 'Tenses',
      lastPositionSeconds: 100,
      durationSeconds: 200,
    });

    // Wait a brief moment to ensure distinct timestamp
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Watch video B
    await learningProgressService.saveProgress({
      contentId: 'vid-b',
      subject: 'Mathematics',
      chapter: 'Polynomials',
      title: 'Zeroes of Polynomials',
      lastPositionSeconds: 100,
      durationSeconds: 200,
    });

    const recent = await learningProgressService.getRecentProgress('20');
    expect(recent[0].contentId).toBe('vid-b');
    expect(recent[1].contentId).toBe('vid-a');
  });

  it('should accurately calculate remaining time and format completion label', async () => {
    // In progress (300 total, 180 watched => 120 remaining => 2 min left)
    const inProg = await learningProgressService.saveProgress({
      contentId: 'vid-calc-1',
      subject: 'Mathematics',
      chapter: 'Trigonometry',
      title: 'Trigonometric Ratios',
      lastPositionSeconds: 180,
      durationSeconds: 300,
    });
    expect(inProg.timeLeft).toBe('2 min left');
    expect(inProg.progressPercent).toBe(60);

    // Completed (300 total, 300 watched => Completed ✓)
    const completedItem = await learningProgressService.saveProgress({
      contentId: 'vid-calc-2',
      subject: 'Mathematics',
      chapter: 'Trigonometry',
      title: 'Heights and Distances',
      lastPositionSeconds: 300,
      durationSeconds: 300,
    });
    expect(completedItem.timeLeft).toBe('Completed ✓');
    expect(completedItem.progressPercent).toBe(100);
    expect(completedItem.completed).toBe(true);
  });
});
