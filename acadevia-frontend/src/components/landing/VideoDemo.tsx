import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEMO_VIDEO_URL = '/assets/demo.mp4'; // local asset placeholder
const DEMO_THUMBNAIL = '/assets/demo-thumbnail.jpg';

/* ------------------------------------------------------------------ */
/*  Overlay backdrop                                                   */
/* ------------------------------------------------------------------ */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 22, stiffness: 260 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Custom Controls                                                    */
/* ------------------------------------------------------------------ */

interface ControlsProps {
  playing: boolean;
  muted: boolean;
  fullscreen: boolean;
  progress: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onSeek: (pct: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  playing,
  muted,
  fullscreen,
  progress,
  onTogglePlay,
  onToggleMute,
  onToggleFullscreen,
  onSeek,
}) => {
  const { t } = useTranslation();
  const barRef = useRef<HTMLDivElement>(null);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    onSeek(pct);
  };

  return (
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 flex flex-col gap-2">
      {/* Progress bar */}
      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label={t('videoDemo.progress', 'Video progress')}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer group"
        onClick={handleBarClick}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(progress + 0.05, 1));
          if (e.key === 'ArrowLeft') onSeek(Math.max(progress - 0.05, 0));
        }}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="text-white hover:text-primary transition-colors"
            aria-label={playing ? t('videoDemo.pause', 'Pause') : t('videoDemo.play', 'Play')}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={onToggleMute}
            className="text-white hover:text-primary transition-colors"
            aria-label={muted ? t('videoDemo.unmute', 'Unmute') : t('videoDemo.mute', 'Mute')}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        <button
          onClick={onToggleFullscreen}
          className="text-white hover:text-primary transition-colors"
          aria-label={
            fullscreen
              ? t('videoDemo.exitFullscreen', 'Exit fullscreen')
              : t('videoDemo.fullscreen', 'Fullscreen')
          }
        >
          {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  VideoModal                                                         */
/* ------------------------------------------------------------------ */

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);

  /* Sync progress */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handler = () => {
      if (vid.duration) setProgress(vid.currentTime / vid.duration);
    };
    vid.addEventListener('timeupdate', handler);
    return () => vid.removeEventListener('timeupdate', handler);
  }, [open]);

  /* Auto-play on open */
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [open]);

  /* Escape to close */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted((m) => !m);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
    }
  }, []);

  const handleSeek = useCallback((pct: number) => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    vid.currentTime = pct * vid.duration;
    setProgress(pct);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('videoDemo.modalLabel', 'Platform demo video')}
        >
          <motion.div
            ref={wrapperRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              src={DEMO_VIDEO_URL}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label={t('videoDemo.close', 'Close video')}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Custom controls */}
            <Controls
              playing={playing}
              muted={muted}
              fullscreen={fullscreen}
              progress={progress}
              onTogglePlay={togglePlay}
              onToggleMute={toggleMute}
              onToggleFullscreen={toggleFullscreen}
              onSeek={handleSeek}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ */
/*  Inline preview player (auto-plays muted when in view)              */
/* ------------------------------------------------------------------ */

const InlinePreview: React.FC<{ onExpand: () => void }> = ({ onExpand }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: wrapperRef, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isIntersecting && !hasInteracted) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isIntersecting, hasInteracted]);

  return (
    <div ref={wrapperRef} className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={onExpand}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={DEMO_VIDEO_URL}
        poster={DEMO_THUMBNAIL}
        muted
        loop
        playsInline
        className="w-full aspect-video object-cover"
        onPlay={() => setHasInteracted(false)}
      />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-lg"
          role="button"
          tabIndex={0}
          aria-label={t('videoDemo.playFull', 'Play full demo')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onExpand();
          }}
        >
          <Play className="h-7 w-7 sm:h-9 sm:w-9 text-primary ml-1" />
        </motion.div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const VideoDemo: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        id="video-demo"
        className="py-20 bg-background-light dark:bg-background-dark"
        aria-labelledby="video-demo-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 id="video-demo-heading" className="text-3xl sm:text-4xl font-bold">
              {t('videoDemo.heading', 'See Acadevia')}{' '}
              <span className="gradient-text">{t('videoDemo.headingHighlight', 'in Action')}</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              {t(
                'videoDemo.subheading',
                'Watch how students learn through interactive games, quizzes, and leaderboards.',
              )}
            </p>
          </motion.div>

          {/* Glassmorphism card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-2 sm:p-3"
          >
            <InlinePreview onExpand={() => setModalOpen(true)} />
          </motion.div>
        </div>
      </section>

      {/* Fullscreen-like modal */}
      <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export { VideoDemo };
