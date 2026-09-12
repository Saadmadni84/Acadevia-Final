import React from 'react';
import { AlertCircle, ArrowRight, Brain, Clock, Zap, Sparkles } from 'lucide-react';

export interface WeakTopicItem {
  title: string;
  subject: string;
  mastery: number;
  recommendation?: string;
  estTime?: string;
  reward?: string;
  status?: string;
}

interface WeakTopicsCardProps {
  onPracticeTopic: (topicTitle: string, mastery: number) => void;
  topics?: WeakTopicItem[];
}

export const WeakTopicsCard: React.FC<WeakTopicsCardProps> = ({
  onPracticeTopic,
  topics,
}) => {
  const activeTopics = (topics && topics.length > 0)
    ? topics
    : [
        {
          title: 'Real Numbers & Foundations',
          subject: 'Mathematics',
          mastery: 0,
          recommendation: 'Recommended: Diagnostic practice assessment',
          estTime: '4 min',
          reward: '+50 XP',
          status: 'Diagnostic',
        },
        {
          title: 'Chemical Reactions & Equations',
          subject: 'Science',
          mastery: 0,
          status: 'Not started',
          estTime: '3 min',
        },
        {
          title: 'Grammar & Subject-Verb Agreement',
          subject: 'English',
          mastery: 0,
          status: 'Not started',
          estTime: '3 min',
        },
      ];

  const primaryTopic = activeTopics[0];
  const secondaryTopics = activeTopics.slice(1, 3);

  return (
    <div className="surface-card surface-card-hover p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-900/40 shadow-2xs">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Needs Attention
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Adaptive skill diagnostic</p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60">
          Weak Topics
        </span>
      </div>

      {/* Primary Weak Topic Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/20 dark:to-transparent border border-rose-200/80 dark:border-rose-900/40 space-y-3 shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {primaryTopic.subject} · Priority 1
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {primaryTopic.title}
            </h4>
          </div>
          <span className="text-xs font-black text-rose-600 dark:text-rose-400 shrink-0 bg-rose-100/70 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800 tabular-nums">
            {primaryTopic.mastery}% mastery
          </span>
        </div>

        {/* Mastery Bar */}
        <div className="w-full h-2 rounded-full bg-rose-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-700"
            style={{ width: `${primaryTopic.mastery}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-0.5">
          <span>{primaryTopic.recommendation}</span>
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {primaryTopic.estTime}
          </span>
        </div>

        <button
          onClick={() => onPracticeTopic(primaryTopic.title, primaryTopic.mastery)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(225,29,72,0.25)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12),0_6px_16px_rgba(225,29,72,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Practice now (+50 XP) →</span>
        </button>
      </div>

      {/* Secondary Topics */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Other Concepts Under Radar
        </span>

        {secondaryTopics.map((item) => (
          <div
            key={item.title}
            onClick={() => onPracticeTopic(item.title, item.mastery)}
            className="group p-3 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/40 hover:bg-white dark:hover:bg-card-dark transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
          >
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-purple-300 transition-colors truncate block">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-400">{item.subject}</span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                  {item.mastery}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {item.status}
                </span>
              </div>
              <span className="text-xs text-slate-300 group-hover:text-primary dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default WeakTopicsCard;
