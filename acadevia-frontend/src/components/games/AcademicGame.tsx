import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Heart, Lightbulb, Play, RotateCcw, Shield, Sparkles, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes.config';
import { gameService } from '@/services/game.service';
import { GameThumbnail } from './GameThumbnail';
import type { GameDefinition } from './gameCatalog';

type State = 'intro' | 'playing' | 'complete';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export const AcademicGame: React.FC<{ game: GameDefinition }> = ({ game }) => {
  const navigate = useNavigate();
  const questions = game.questions ?? [];
  const [state, setState] = useState<State>('intro');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [labReady, setLabReady] = useState(false);

  const question = questions[index];
  const accuracy = useMemo(() => (index || answered) ? Math.round((correctCount / (index + (answered ? 1 : 0))) * 100) : 0, [index, answered, correctCount]);

  useEffect(() => {
    if (state !== 'playing') return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const start = () => {
    setState('playing'); setIndex(0); setScore(0); setCorrectCount(0); setStreak(0); setLives(3); setElapsed(0); setSelected(null); setAnswered(false); setLabReady(false);
  };
  const choose = (option: string) => {
    if (answered || !question || (game.mechanic === 'lab' && !labReady)) return;
    const isCorrect = option === question.answer;
    setSelected(option); setAnswered(true); setCorrect(isCorrect);
    if (isCorrect) { setScore((value) => value + 10 + (streak >= 2 ? 5 : 0)); setCorrectCount((value) => value + 1); setStreak((value) => value + 1); }
    else { setStreak(0); setLives((value) => Math.max(0, value - 1)); }
  };
  const next = async () => {
    if (index + 1 < questions.length && lives > 0) { setIndex((value) => value + 1); setSelected(null); setAnswered(false); setLabReady(false); return; }
    setState('complete');
    const finalScore = score + (correct ? 0 : 0);
    try { await gameService.submitScore(game.id, { score: finalScore, timeTaken: elapsed }); } catch { /* API is optional: retain the real local session result. */ }
    try { localStorage.setItem(`acadevia_game_progress_${game.id}`, JSON.stringify({ score: finalScore, accuracy, completedAt: new Date().toISOString() })); } catch { /* storage unavailable */ }
  };

  if (state === 'intro') return <div className="mx-auto max-w-5xl space-y-5 p-2 sm:p-4">
    <button onClick={() => navigate(ROUTES.GAMES)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to Games</button>
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark md:grid md:grid-cols-2">
      <GameThumbnail game={game} className="min-h-52 md:min-h-full" />
      <div className="space-y-5 p-6 sm:p-8">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">{game.subject} · Interactive game</p><h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{game.title}</h1><p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{game.description}</p></div>
        <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">🎓 Designed for Classes {game.classes}</span><span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">⭐ {game.difficulty}</span><span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-800">⚡ +{game.xpReward} XP</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">⏱ {game.estimatedTime}</span></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><h2 className="text-xs font-black uppercase tracking-wider text-gray-500">You’ll learn</h2><ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">{game.learning.map((item) => <li key={item}>✓ {item}</li>)}</ul></div><div><h2 className="text-xs font-black uppercase tracking-wider text-gray-500">How to play</h2><ol className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">{game.howToPlay.map((item, i) => <li key={item}>{i + 1}. {item}</li>)}</ol></div></div>
        <Button variant="gradient" size="lg" onClick={start} leftIcon={<Play className="h-5 w-5" />}>Start Game</Button>
      </div>
    </section>
  </div>;

  if (state === 'complete') return <div className="mx-auto max-w-2xl p-4"><motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-card-dark"><Trophy className="mx-auto h-16 w-16 text-amber-500" /><h1 className="mt-4 text-3xl font-extrabold">Mission complete!</h1><p className="mt-2 text-gray-500">Wonderful persistence—your next stage is ready whenever you are.</p><div className="my-7 grid grid-cols-3 gap-3"><Stat label="Score" value={String(score)} /><Stat label="Accuracy" value={`${Math.min(100, accuracy)}%`} /><Stat label="XP earned" value={`+${Math.round(game.xpReward * Math.min(1, score / (questions.length * 10)))}`} /></div><div className="flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={() => navigate(ROUTES.GAMES)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Games</Button><Button variant="gradient" onClick={start} leftIcon={<RotateCcw className="h-4 w-4" />}>Play again</Button></div></motion.section></div>;

  const isLab = game.mechanic === 'lab';
  const isBlaster = game.mechanic === 'blaster';
  const isCode = game.mechanic === 'code';
  return <div className="mx-auto max-w-4xl space-y-4 p-2 sm:p-4">
    <header className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-card-dark"><div className="flex flex-wrap items-center justify-between gap-3"><button onClick={() => navigate(ROUTES.GAMES)} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-primary"><ArrowLeft className="h-4 w-4" />Exit</button><div className="flex items-center gap-3 text-sm font-bold"><span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4 text-primary" />{formatTime(elapsed)}</span><span className="inline-flex items-center gap-1"><Zap className="h-4 w-4 text-amber-500" />{score}</span><span className="inline-flex items-center gap-1"><Heart className="h-4 w-4 fill-rose-500 text-rose-500" />{lives}</span></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></div></header>
    <section className={`overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-card-dark ${isBlaster ? 'ring-2 ring-fuchsia-300/50' : ''}`}>
      <div className={`relative p-6 text-white bg-gradient-to-r ${game.colors}`}><div className="absolute right-4 top-3 text-5xl opacity-80">{question.visual}</div><p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">{game.stages[Math.min(game.stages.length - 1, Math.floor(index / 2))]} · Challenge {index + 1}/{questions.length}</p><h1 className="mt-4 max-w-2xl text-xl font-bold sm:text-2xl">{question.prompt}</h1>{isBlaster && <div className="mt-4 flex items-center gap-2 text-sm font-bold"><Shield className="h-4 w-4" />Shield stable · Combo x{Math.max(1, streak)}</div>}{isCode && <div className="mt-4 rounded-xl bg-slate-950/40 p-3 font-mono text-xs">// Choose the safest, correct block<br />robot.run(mission)</div>}</div>
      <div className="p-5 sm:p-6">
        {isLab && <div className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-cyan-950">Safety first: observe before you conclude.</p><p className="text-sm text-cyan-800">Set up the virtual apparatus to unlock the observation.</p></div><Button size="sm" variant={labReady ? 'outline' : 'primary'} onClick={() => setLabReady(true)}>{labReady ? 'Apparatus ready ✓' : 'Set up experiment'}</Button></div>{labReady && <p className="mt-3 text-sm font-semibold text-cyan-900">Observation recorded: now identify the best explanation.</p>}</div>}
        {game.mechanic === 'timeline' && <div className="mb-5 flex items-center gap-2 overflow-auto text-xs font-bold text-amber-900"><span className="rounded-full bg-amber-100 px-3 py-2">Explore clue</span><span>→</span><span className="rounded-full bg-amber-100 px-3 py-2">Place in history</span><span>→</span><span className="rounded-full bg-amber-100 px-3 py-2">Unlock location</span></div>}
        <div className="grid gap-3 sm:grid-cols-2">{question.options.map((option) => { const selectedOption = selected === option; const status = answered ? option === question.answer ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : selectedOption ? 'border-rose-400 bg-rose-50 text-rose-950' : 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-primary hover:bg-primary/5'; return <button key={option} disabled={answered || (isLab && !labReady)} onClick={() => choose(option)} className={`rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${status}`}><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-xs">{String.fromCharCode(65 + question.options.indexOf(option))}</span>{option}</button>; })}</div>
        {answered && <div className={`mt-5 rounded-2xl p-4 text-sm ${correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}><div className="flex items-start gap-2"><span>{correct ? <CheckCircle2 className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}</span><div><p className="font-bold">{correct ? 'Great job! Your progress is powering up.' : 'Almost there—here’s a clue for next time.'}</p><p className="mt-1">{correct ? `+${10 + (streak >= 2 ? 5 : 0)} points · Combo x${streak}` : question.hint}</p></div></div><Button className="mt-3" size="sm" onClick={next} rightIcon={<Sparkles className="h-4 w-4" />}>{index + 1 === questions.length || lives === 0 ? 'See results' : 'Next challenge'}</Button></div>}
      </div>
    </section>
  </div>;
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800"><p className="text-xl font-extrabold text-primary">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p></div>;
