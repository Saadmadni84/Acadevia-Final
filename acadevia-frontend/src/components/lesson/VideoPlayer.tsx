import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopupQuestion {
  timestamp: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface VideoPlayerProps {
  src: string;
  title: string;
  popupQuestions?: PopupQuestion[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, popupQuestions = [], onProgress, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<PopupQuestion | null>(null);
  const [answeredTimes, setAnsweredTimes] = useState<Set<number>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const togglePlay = () => {
    if (!videoRef.current || activeQuestion) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    onProgress?.(duration ? (t / duration) * 100 : 0);

    const q = popupQuestions.find(pq => Math.abs(pq.timestamp - t) < 0.5 && !answeredTimes.has(pq.timestamp));
    if (q) { setActiveQuestion(q); videoRef.current.pause(); setPlaying(false); }
  };

  const handleAnswer = (idx: number) => {
    if (!activeQuestion) return;
    setSelectedAnswer(idx);
    setTimeout(() => {
      setAnsweredTimes(prev => new Set(prev).add(activeQuestion.timestamp));
      setActiveQuestion(null);
      setSelectedAnswer(null);
      videoRef.current?.play();
      setPlaying(true);
    }, 1500);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => playing && setShowControls(false), 3000);
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden group" onMouseMove={handleMouseMove} onMouseLeave={() => playing && setShowControls(false)}>
      <video ref={videoRef} src={src} className="w-full aspect-video" onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} onTimeUpdate={handleTimeUpdate} onEnded={() => { setPlaying(false); onComplete?.(); }} onClick={togglePlay} />

      <AnimatePresence>
        {activeQuestion && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full">
              <p className="text-xs font-semibold text-primary mb-2 uppercase">Quick Question</p>
              <h3 className="text-lg font-bold mb-4">{activeQuestion.question}</h3>
              <div className="space-y-2">
                {activeQuestion.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={selectedAnswer !== null}
                    className={cn('w-full text-left p-3 rounded-xl border-2 transition-all text-sm',
                      selectedAnswer === null ? 'border-gray-200 dark:border-gray-700 hover:border-primary' :
                      idx === activeQuestion.correctIndex ? 'border-secondary bg-secondary/10' :
                      idx === selectedAnswer ? 'border-accent bg-accent/10' : 'border-gray-200 dark:border-gray-700 opacity-50'
                    )}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && !activeQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="cursor-pointer h-1 bg-white/30 rounded-full mb-3 group/bar" onClick={seek}>
              <div className="h-full bg-primary rounded-full relative" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
              {popupQuestions.map(q => (
                <div key={q.timestamp} className="absolute top-0 w-1.5 h-1.5 bg-yellow-400 rounded-full -translate-y-0.5" style={{ left: `${(q.timestamp / duration) * 100}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay}>{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}><SkipBack className="h-4 w-4" /></button>
                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}><SkipForward className="h-4 w-4" /></button>
                <button onClick={() => setMuted(!muted)}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
                <span className="text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate max-w-[200px]">{title}</span>
                <button onClick={() => videoRef.current?.requestFullscreen?.()}><Maximize className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && currentTime === 0 && !activeQuestion && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center hover:bg-primary transition-colors">
            <Play className="h-7 w-7 text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};

export { VideoPlayer };
