import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { QuizCreator } from '@/components/teacher/QuizCreator';

const QuizBuilderPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('teacher.quizBuilder.title')} />
      <QuizCreator />
    </div>
  );
};

export default QuizBuilderPage;
