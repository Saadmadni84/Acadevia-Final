import React from 'react';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

const mockQuestions = [
  { id: 'q1', question: 'What is the discriminant of x² + 5x + 6 = 0?', options: ['1', '25', '36', '11'], correctIndex: 0, explanation: 'D = b² - 4ac = 25 - 24 = 1', points: 10 },
  { id: 'q2', question: 'Which method is used to solve x² - 9 = 0?', options: ['Factoring', 'Quadratic formula', 'Both A and B', 'None'], correctIndex: 2, points: 10 },
  { id: 'q3', question: 'If b² - 4ac < 0, the equation has:', options: ['Two real roots', 'One real root', 'No real roots', 'Infinite roots'], correctIndex: 2, explanation: 'A negative discriminant means no real solutions exist.', points: 15 },
];

const QuizPage: React.FC = () => {
  return (
    <div className="p-1 py-6">
      <QuizPlayer
        title="Quadratic Equations Quiz"
        questions={mockQuestions}
        timeLimit={300}
        onComplete={(result) => console.log('Quiz complete:', result)}
      />
    </div>
  );
};

export default QuizPage;
