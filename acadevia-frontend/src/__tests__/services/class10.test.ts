import { describe, it, expect } from 'vitest';
import { dataService } from '@/services/data.service';

describe('Class 10 Demo Ecosystem', () => {
  it('loads all 10 Class 10 students correctly', () => {
    const studentUsernames = [
      'aarav.sharma10', 'ananya.verma10', 'rohan.mehta10', 'priya.singh10',
      'arjun.patel10', 'kavya.gupta10', 'aditya.kumar10', 'ishita.rao10',
      'vihaan.joshi10', 'meera.nair10'
    ];

    studentUsernames.forEach(username => {
      const user = dataService.getUserByEmail(username);
      expect(user).toBeDefined();
      expect(user?.role).toBe('STUDENT');
      expect(user?.classGrade).toBe(10);
    });
  });

  it('loads all 6 Class 10 subject teachers correctly', () => {
    const teacherUsernames = [
      { username: 'rahul.math', subject: 'Mathematics' },
      { username: 'neha.science', subject: 'Science' },
      { username: 'amit.english', subject: 'English' },
      { username: 'sunita.hindi', subject: 'Hindi' },
      { username: 'vikram.social', subject: 'Social Science' },
      { username: 'pooja.cs', subject: 'Computer Science' }
    ];

    teacherUsernames.forEach(({ username, subject }) => {
      const teacher = dataService.getUserByEmail(username);
      expect(teacher).toBeDefined();
      expect(teacher?.role).toBe('TEACHER');
      expect(teacher?.subject).toBe(subject);
      expect(teacher?.classesTaught).toContain(10);
    });
  });

  it('provides 1 quiz for each of the 6 subjects in Class 10', () => {
    const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];

    subjects.forEach(subject => {
      const quizzes = dataService.getQuizzesByClassAndSubject(10, subject);
      expect(quizzes.length).toBeGreaterThanOrEqual(1);
      const quiz = quizzes[0];
      expect(quiz.classGrade).toBe(10);
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
    });
  });
});
