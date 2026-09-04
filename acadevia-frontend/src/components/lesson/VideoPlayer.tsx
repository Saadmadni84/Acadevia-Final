import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contentService } from '@/services/content.service';

interface PopupQuestion {
  timestamp: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface VideoPlayerProps {
  src: string;
  title: string;
  videoId?: number | string;
  popupQuestions?: PopupQuestion[];
  initialTime?: number;
  onProgress?: (progress: number) => void;
  onProgressUpdate?: (
    currentTime: number,
    duration: number,
    progressPct: number
  ) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  videoId,
  popupQuestions = [],
  initialTime = 0,
  onProgress,
  onProgressUpdate,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeQuestion, setActiveQuestion] =
    useState<PopupQuestion | null>(null);
  const [answeredTimes, setAnsweredTimes] = useState<Set<number>>(
    new Set()
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const controlsTimeout =
    useRef<ReturnType<typeof setTimeout>>(undefined);

  /*
   * Continue Learning / progress tracking refs
   */
  const currentPosRef = useRef<number>(0);
  const currentDurRef = useRef<number>(0);
  const lastSavedTimeRef = useRef<number>(0);
  const lastSavedTimestampRef = useRef<number>(0);
  const initialRegisteredRef = useRef<boolean>(false);

  /*
   * Cloud video support
   *
   * If videoId is available and src is empty/#,
   * resolve the real playable URL from the backend.
   */
  useEffect(() => {
    let cancelled = false;

    if (videoId && (!src || src === '#')) {
      contentService
        .getVideoPlayUrl(videoId)
        .then(({ presignedUrl, streamUrl }) => {
          if (!cancelled) {
            setResolvedSrc(presignedUrl || streamUrl || '');
          }
        })
        .catch((error) => {
          console.error('Failed to resolve video URL:', error);

          if (!cancelled) {
            setResolvedSrc(src || '');
          }
        });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      cancelled = true;
    };
  }, [videoId, src]);

  /*
   * Save learning progress.
   *
   * Saves:
   * - first meaningful playback
   * - periodically during playback
   * - pause
   * - seek
   * - popup question
   * - video completion
   * - leaving the page
   */
  const emitProgress = useCallback(
    (t: number, d: number, force: boolean = false) => {
      if (!onProgressUpdate) return;

      const effectiveDur =
        d > 0 ? d : currentDurRef.current || duration || 5;

      currentPosRef.current = t;

      if (effectiveDur > 0) {
        currentDurRef.current = effectiveDur;
      }

      const now = Date.now();

      const timeDiff = Math.abs(
        t - lastSavedTimeRef.current
      );

      const realTimeDiff =
        now - lastSavedTimestampRef.current;

      /*
       * First meaningful checkpoint.
       *
       * This is intentionally low so very short videos
       * are still registered in Continue Learning.
       */
      if (
        !initialRegisteredRef.current &&
        t >= 0.5
      ) {
        initialRegisteredRef.current = true;

        lastSavedTimeRef.current = t;
        lastSavedTimestampRef.current = now;

        const pct = Math.min(
          100,
          Math.round((t / effectiveDur) * 100)
        );

        onProgressUpdate(
          t,
          effectiveDur,
          pct
        );

        return;
      }

      /*
       * Periodic save:
       * approximately every 3 seconds of real time
       * after at least 1.5 seconds of playback movement.
       *
       * force=true saves immediately.
       */
      if (
        force ||
        (realTimeDiff >= 3000 && timeDiff >= 1.5)
      ) {
        lastSavedTimeRef.current = t;
        lastSavedTimestampRef.current = now;

        const pct = Math.min(
          100,
          Math.round((t / effectiveDur) * 100)
        );

        onProgressUpdate(
          t,
          effectiveDur,
          pct
        );
      }
    },
    [onProgressUpdate, duration]
  );

  /*
   * Play / pause
   */
  const togglePlay = () => {
    if (!videoRef.current || activeQuestion) {
      return;
    }

    if (playing) {
      videoRef.current.pause();

      emitProgress(
        videoRef.current.currentTime,
        videoRef.current.duration || duration,
        true
      );
    } else {
      videoRef.current
        .play()
        .catch((error) => {
          console.error(
            'Unable to play video:',
            error
          );
        });
    }

    setPlaying(!playing);
  };

  /*
   * Video metadata loaded
   */
  const handleLoadedMetadata = () => {
    if (!videoRef.current) {
      return;
    }

    const d = videoRef.current.duration || 0;

    setDuration(d);
    currentDurRef.current = d;

    /*
     * Resume from Continue Learning position.
     */
    if (
      initialTime > 0 &&
      initialTime < d
    ) {
      videoRef.current.currentTime =
        initialTime;

      setCurrentTime(initialTime);

      currentPosRef.current =
        initialTime;

      lastSavedTimeRef.current =
        initialTime;
    }
  };

  /*
   * Sometimes initialTime arrives after
   * video metadata has already loaded.
   *
   * This effect handles that case.
   */
  useEffect(() => {
    if (
      initialTime > 0 &&
      videoRef.current
    ) {
      const d =
        videoRef.current.duration || 0;

      if (
        d === 0 ||
        initialTime < d
      ) {
        if (
          Math.abs(
            videoRef.current.currentTime -
              initialTime
          ) > 0.5
        ) {
          videoRef.current.currentTime =
            initialTime;

          setCurrentTime(
            initialTime
          );

          currentPosRef.current =
            initialTime;

          lastSavedTimeRef.current =
            initialTime;
        }
      }
    }
  }, [initialTime]);

  /*
   * Video time update
   */
  const handleTimeUpdate = () => {
    if (!videoRef.current) {
      return;
    }

    const t =
      videoRef.current.currentTime;

    const d =
      videoRef.current.duration ||
      duration ||
      currentDurRef.current ||
      5;

    currentPosRef.current = t;

    if (
      d > 0 &&
      !isNaN(d)
    ) {
      currentDurRef.current = d;
    }

    setCurrentTime(t);

    const pct =
      d > 0
        ? (t / d) * 100
        : 0;

    /*
     * Normal progress callback
     */
    onProgress?.(pct);

    /*
     * Continue Learning progress
     */
    emitProgress(
      t,
      d,
      false
    );

    /*
     * Popup question detection
     */
    const q =
      popupQuestions.find(
        (pq) =>
          Math.abs(
            pq.timestamp - t
          ) < 0.5 &&
          !answeredTimes.has(
            pq.timestamp
          )
      );

    if (q) {
      setActiveQuestion(q);

      videoRef.current.pause();

      setPlaying(false);

      /*
       * Save position before showing
       * the popup question.
       */
      emitProgress(
        t,
        d,
        true
      );
    }
  };

  /*
   * Video completed
   */
  const handleEnded = () => {
    setPlaying(false);

    if (videoRef.current) {
      const d =
        videoRef.current.duration ||
        duration;

      /*
       * Save 100% progress.
       */
      emitProgress(
        d,
        d,
        true
      );
    }

    onComplete?.();
  };

  /*
   * Save progress when user:
   *
   * - closes tab
   * - navigates away
   * - switches visibility
   * - component unmounts
   */
  useEffect(() => {
    const handleLeave = () => {
      const p =
        currentPosRef.current;

      const d =
        currentDurRef.current ||
        duration;

      if (
        d > 0 &&
        p > 0
      ) {
        const pct = Math.min(
          100,
          Math.round(
            (p / d) * 100
          )
        );

        onProgressUpdate?.(
          p,
          d,
          pct
        );
      }
    };

    window.addEventListener(
      'beforeunload',
      handleLeave
    );

    window.addEventListener(
      'pagehide',
      handleLeave
    );

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        'hidden'
      ) {
        handleLeave();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleLeave
      );

      window.removeEventListener(
        'pagehide',
        handleLeave
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );

      /*
       * Important:
       * save latest position when component
       * is removed during navigation.
       */
      handleLeave();
    };
  }, [onProgressUpdate, duration]);

  /*
   * Popup question answer
   */
  const handleAnswer = (idx: number) => {
    if (!activeQuestion) {
      return;
    }

    setSelectedAnswer(idx);

    setTimeout(() => {
      setAnsweredTimes(
        (prev) =>
          new Set(
            prev
          ).add(
            activeQuestion.timestamp
          )
      );

      setActiveQuestion(null);
      setSelectedAnswer(null);

      videoRef.current
        ?.play()
        .catch((error) => {
          console.error(
            'Unable to resume video:',
            error
          );
        });

      setPlaying(true);
    }, 1500);
  };

  /*
   * Seek using progress bar
   */
  const seek = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!videoRef.current) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const newTime =
      ((e.clientX - rect.left) /
        rect.width) *
      duration;

    videoRef.current.currentTime =
      newTime;

    setCurrentTime(
      newTime
    );

    /*
     * Save immediately after seek.
     */
    emitProgress(
      newTime,
      duration,
      true
    );
  };

  /*
   * Format seconds into mm:ss
   */
  const formatTime = (
    s: number
  ) =>
    `${Math.floor(s / 60)}:${String(
      Math.floor(s % 60)
    ).padStart(2, '0')}`;

  /*
   * Show controls when mouse moves
   */
  const handleMouseMove = () => {
    setShowControls(true);

    if (
      controlsTimeout.current
    ) {
      clearTimeout(
        controlsTimeout.current
      );
    }

    controlsTimeout.current =
      setTimeout(
        () =>
          playing &&
          setShowControls(false),
        3000
      );
  };

  return (
    <div
      className="relative bg-black rounded-xl overflow-hidden group"
      onMouseMove={
        handleMouseMove
      }
      onMouseLeave={() =>
        playing &&
        setShowControls(false)
      }
    >
      <video
        ref={videoRef}
        src={resolvedSrc}
        className="w-full aspect-video"
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onTimeUpdate={
          handleTimeUpdate
        }
        onPlay={() => {
          if (videoRef.current) {
            emitProgress(
              videoRef.current
                .currentTime,
              videoRef.current
                .duration ||
                duration,
              false
            );
          }

          setPlaying(true);
        }}
        onPause={() => {
          if (videoRef.current) {
            emitProgress(
              videoRef.current
                .currentTime,
              videoRef.current
                .duration ||
                duration,
              true
            );
          }

          setPlaying(false);
        }}
        onSeeked={() => {
          if (videoRef.current) {
            emitProgress(
              videoRef.current
                .currentTime,
              videoRef.current
                .duration ||
                duration,
              true
            );
          }
        }}
        onEnded={
          handleEnded
        }
        onClick={
          togglePlay
        }
        muted={muted}
      />

      <AnimatePresence>
        {activeQuestion && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full">
              <p className="text-xs font-semibold text-primary mb-2 uppercase">
                Quick Question
              </p>

              <h3 className="text-lg font-bold mb-4">
                {
                  activeQuestion.question
                }
              </h3>

              <div className="space-y-2">
                {activeQuestion.options.map(
                  (opt, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleAnswer(
                          idx
                        )
                      }
                      disabled={
                        selectedAnswer !==
                        null
                      }
                      className={cn(
                        'w-full text-left p-3 rounded-xl border-2 transition-all text-sm',
                        selectedAnswer ===
                          null
                          ? 'border-gray-200 dark:border-gray-700 hover:border-primary'
                          : idx ===
                            activeQuestion.correctIndex
                          ? 'border-secondary bg-secondary/10'
                          : idx ===
                            selectedAnswer
                          ? 'border-accent bg-accent/10'
                          : 'border-gray-200 dark:border-gray-700 opacity-50'
                      )}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls &&
          !activeQuestion && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              <div
                className="cursor-pointer h-1 bg-white/30 rounded-full mb-3 group/bar"
                onClick={seek}
              >
                <div
                  className="h-full bg-primary rounded-full relative"
                  style={{
                    width: `${
                      duration
                        ? (currentTime /
                            duration) *
                          100
                        : 0
                    }%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                </div>

                {popupQuestions.map(
                  (q) => (
                    <div
                      key={
                        q.timestamp
                      }
                      className="absolute top-0 w-1.5 h-1.5 bg-yellow-400 rounded-full -translate-y-0.5"
                      style={{
                        left: `${
                          duration
                            ? (q.timestamp /
                                duration) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={
                      togglePlay
                    }
                  >
                    {playing ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (
                        videoRef.current
                      ) {
                        videoRef.current.currentTime -= 10;
                      }
                    }}
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        videoRef.current
                      ) {
                        videoRef.current.currentTime += 10;
                      }
                    }}
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      setMuted(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  <span className="text-xs">
                    {formatTime(
                      currentTime
                    )}{' '}
                    /{' '}
                    {formatTime(
                      duration
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate max-w-[200px]">
                    {title}
                  </span>

                  <button
                    onClick={() =>
                      videoRef.current?.requestFullscreen?.()
                    }
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {!playing &&
        currentTime === 0 &&
        !activeQuestion && (
          <button
            onClick={
              togglePlay
            }
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center hover:bg-primary transition-colors">
              <Play className="h-7 w-7 text-white ml-1" />
            </div>
          </button>
        )}
    </div>
  );
};

export { VideoPlayer };