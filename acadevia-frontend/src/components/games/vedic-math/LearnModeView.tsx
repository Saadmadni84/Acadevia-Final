import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VEDIC_TECHNIQUES } from './vedicTechniquesData';
import type { VedicTopicId, VedicGradeBand } from './types';

interface LearnModeViewProps {
  gradeBand: VedicGradeBand;
  onBack: () => void;
  onStartPractice: (topicId: VedicTopicId) => void;
  onRecordXP: (amount: number) => void;
}

export const LearnModeView: React.FC<LearnModeViewProps> = ({
  gradeBand,
  onBack,
  onStartPractice,
  onRecordXP,
}) => {
  const availableTopics = Object.values(VEDIC_TECHNIQUES).filter((t) =>
    t.gradeBand.includes(gradeBand)
  );

  const [selectedTopicId, setSelectedTopicId] = useState<VedicTopicId>(
    availableTopics[0]?.id || 'mult-11'
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [interactiveInput, setInteractiveInput] = useState<string>('');
  const [interactiveFeedback, setInteractiveFeedback] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    message: string;
  }>({ status: 'idle', message: '' });

  const activeTechnique = VEDIC_TECHNIQUES[selectedTopicId];
  const sample = activeTechnique.sampleQuestions[0];

  const handleTestAnswer = () => {
    if (!sample) return;
    if (interactiveInput.trim() === sample.answer) {
      setInteractiveFeedback({
        status: 'correct',
        message: '🎉 Perfect! You applied the Vedic technique correctly!',
      });
      onRecordXP(15);
    } else {
      setInteractiveFeedback({
        status: 'wrong',
        message: `Not quite. Correct answer: ${sample.answer} (${sample.steps})`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
          Learn Mode · Classes {gradeBand}
        </span>
      </div>

      {/* Technique Selector Carousel / Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {availableTopics.map((tech) => {
          const isSelected = tech.id === selectedTopicId;
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => {
                setSelectedTopicId(tech.id);
                setActiveStepIndex(0);
                setInteractiveInput('');
                setInteractiveFeedback({ status: 'idle', message: '' });
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              {tech.name}
            </button>
          );
        })}
      </div>

      {/* Main Technique Card */}
      <motion.div
        key={activeTechnique.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-xl space-y-6"
      >
        {/* Title and Sanskrit Sutra */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            <span>Sanskrit Sutra: {activeTechnique.sanskritName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {activeTechnique.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {activeTechnique.fullDesc}
          </p>
        </div>

        {/* When to use banner */}
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-black text-amber-900 dark:text-amber-200 block mb-0.5">
              When to use this shortcut:
            </strong>
            <span className="text-amber-800 dark:text-amber-300">
              {activeTechnique.whenToUse}
            </span>
          </div>
        </div>

        {/* Step-by-Step Interactive Flow */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Step-by-Step Walkthrough ({activeStepIndex + 1} of{' '}
              {activeTechnique.steps.length})
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => prev - 1)}
                className="h-8 px-2.5 rounded-xl cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={activeStepIndex === activeTechnique.steps.length - 1}
                onClick={() => setActiveStepIndex((prev) => prev + 1)}
                className="h-8 px-2.5 rounded-xl cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                  {activeStepIndex + 1}
                </span>
                <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {activeTechnique.steps[activeStepIndex]?.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {activeTechnique.steps[activeStepIndex]?.detail}
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono text-center text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300">
                {activeTechnique.steps[activeStepIndex]?.mathVisual}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Worked Example */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-300/60 dark:border-amber-900/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <BookOpen className="h-4 w-4" />
            <span>Worked Example: {activeTechnique.workedExample.problem}</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl font-mono text-center text-lg sm:text-xl font-black text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800">
            {activeTechnique.workedExample.visualBreakdown}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
            {activeTechnique.workedExample.stepByStep.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Try It Yourself section */}
        {sample && (
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                🎯 Try It Yourself (Instant Mental Check)
              </span>
              <span className="text-xs text-slate-400">Solve: {sample.question}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="text-2xl font-black font-mono tracking-wider text-amber-300">
                {sample.question} =
              </div>
              <input
                type="text"
                value={interactiveInput}
                onChange={(e) => setInteractiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTestAnswer();
                }}
                placeholder="Type answer..."
                className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-lg font-bold w-40 text-center focus:outline-none focus:border-amber-400"
              />
              <Button
                variant="gradient"
                size="sm"
                onClick={handleTestAnswer}
                className="h-11 px-5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                Check Shortcut
              </Button>
            </div>

            {interactiveFeedback.status !== 'idle' && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  interactiveFeedback.status === 'correct'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                }`}
              >
                {interactiveFeedback.message}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="gradient"
            size="lg"
            onClick={() => onStartPractice(selectedTopicId)}
            className="font-black text-sm px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg cursor-pointer"
          >
            <span>Practice This Technique 🎯</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
