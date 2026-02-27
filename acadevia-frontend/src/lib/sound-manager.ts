import { Howl } from 'howler';

export type SoundName =
  | 'xp-gain'
  | 'level-up'
  | 'badge-unlock'
  | 'correct-answer'
  | 'wrong-answer'
  | 'streak-bonus';

const SOUND_PATHS: Record<SoundName, string> = {
  'xp-gain': '/assets/sounds/xp-gain.mp3',
  'level-up': '/assets/sounds/level-up.mp3',
  'badge-unlock': '/assets/sounds/badge-unlock.mp3',
  'correct-answer': '/assets/sounds/correct-answer.mp3',
  'wrong-answer': '/assets/sounds/wrong-answer.mp3',
  'streak-bonus': '/assets/sounds/streak-bonus.mp3',
};

class SoundManager {
  private sounds: Map<SoundName, Howl> = new Map();
  private enabled = true;

  play(soundName: SoundName): void {
    if (!this.enabled) return;

    let howl = this.sounds.get(soundName);

    if (!howl) {
      howl = new Howl({
        src: [SOUND_PATHS[soundName]],
        preload: true,
        volume: 0.5,
      });
      this.sounds.set(soundName, howl);
    }

    howl.play();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.sounds.forEach((howl) => howl.stop());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(soundName: SoundName, volume: number): void {
    const howl = this.sounds.get(soundName);
    if (howl) {
      howl.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  setGlobalVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((howl) => howl.volume(clamped));
  }

  preload(soundName: SoundName): void {
    if (!this.sounds.has(soundName)) {
      const howl = new Howl({
        src: [SOUND_PATHS[soundName]],
        preload: true,
        volume: 0.5,
      });
      this.sounds.set(soundName, howl);
    }
  }

  preloadAll(): void {
    (Object.keys(SOUND_PATHS) as SoundName[]).forEach((name) => this.preload(name));
  }

  unload(soundName: SoundName): void {
    const howl = this.sounds.get(soundName);
    if (howl) {
      howl.unload();
      this.sounds.delete(soundName);
    }
  }

  unloadAll(): void {
    this.sounds.forEach((howl) => howl.unload());
    this.sounds.clear();
  }
}

export const soundManager = new SoundManager();
export default soundManager;
