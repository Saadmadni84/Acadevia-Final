import { useState, useCallback, useEffect, useRef } from 'react';

type VideoQuality = '360p' | '480p' | '720p' | '1080p';
type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export interface PopupQuestion {
  id: string;
  timestamp: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: VideoQuality;
  speed: PlaybackSpeed;
  isFullscreen: boolean;
  popupQuestion: PopupQuestion | null;
}

interface UseVideoPlayerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  popupQuestions?: PopupQuestion[];
  onQuestionAnswer?: (questionId: string, selectedIndex: number, correct: boolean) => void;
}

export function useVideoPlayer({
  videoRef,
  containerRef,
  popupQuestions = [],
  onQuestionAnswer,
}: UseVideoPlayerOptions) {
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    quality: '720p',
    speed: 1,
    isFullscreen: false,
    popupQuestion: null,
  });

  const answeredQuestionsRef = useRef<Set<string>>(new Set());

  const play = useCallback(() => {
    videoRef.current?.play();
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = Math.max(0, Math.min(time, video.duration));
        setState((prev) => ({ ...prev, currentTime: video.currentTime }));
      }
    },
    [videoRef],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const clamped = Math.max(0, Math.min(1, volume));
      if (videoRef.current) {
        videoRef.current.volume = clamped;
      }
      setState((prev) => ({ ...prev, volume: clamped }));
    },
    [videoRef],
  );

  const setQuality = useCallback((quality: VideoQuality) => {
    setState((prev) => ({ ...prev, quality }));
  }, []);

  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
      setState((prev) => ({ ...prev, speed }));
    },
    [videoRef],
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    } else {
      container.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    }
  }, [containerRef]);

  const answerPopupQuestion = useCallback(
    (questionId: string, selectedIndex: number) => {
      const question = popupQuestions.find((q) => q.id === questionId);
      if (!question) return;

      const correct = selectedIndex === question.correctIndex;
      answeredQuestionsRef.current.add(questionId);
      setState((prev) => ({ ...prev, popupQuestion: null }));
      onQuestionAnswer?.(questionId, selectedIndex, correct);
      play();
    },
    [popupQuestions, onQuestionAnswer, play],
  );

  const dismissPopupQuestion = useCallback(() => {
    setState((prev) => ({ ...prev, popupQuestion: null }));
    play();
  }, [play]);

  // Time update & popup question detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setState((prev) => ({ ...prev, currentTime }));

      for (const question of popupQuestions) {
        if (
          !answeredQuestionsRef.current.has(question.id) &&
          Math.abs(currentTime - question.timestamp) < 0.5
        ) {
          pause();
          setState((prev) => ({ ...prev, popupQuestion: question }));
          break;
        }
      }
    };

    const onLoadedMetadata = () => {
      setState((prev) => ({ ...prev, duration: video.duration }));
    };

    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onEnded = () => setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [videoRef, popupQuestions, pause]);

  // Fullscreen change detection
  useEffect(() => {
    const onFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          state.isPlaying ? pause() : play();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(state.currentTime - 10);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(state.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(state.volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(state.volume - 0.1);
          break;
        case 'm':
          e.preventDefault();
          setVolume(state.volume === 0 ? 1 : 0);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.isPlaying, state.currentTime, state.volume, play, pause, seek, setVolume, toggleFullscreen]);

  return {
    ...state,
    play,
    pause,
    seek,
    setVolume,
    setQuality,
    setSpeed,
    toggleFullscreen,
    answerPopupQuestion,
    dismissPopupQuestion,
  };
}
