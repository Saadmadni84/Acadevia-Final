declare module 'howler' {
  export interface HowlOptions {
    src: string | string[];
    volume?: number;
    html5?: boolean;
    loop?: boolean;
    preload?: boolean | 'metadata';
    autoplay?: boolean;
    mute?: boolean;
    rate?: number;
    pool?: number;
    format?: string[];
    onload?: () => void;
    onloaderror?: (id: number, error: unknown) => void;
    onplay?: (id: number) => void;
    onend?: (id: number) => void;
    onpause?: (id: number) => void;
    onstop?: (id: number) => void;
    onmute?: (id: number) => void;
    onvolume?: (id: number) => void;
    onrate?: (id: number) => void;
    onseek?: (id: number) => void;
    onfade?: (id: number) => void;
    onunlock?: () => void;
  }

  export class Howl {
    constructor(options: HowlOptions);
    play(spriteOrId?: string | number): number;
    pause(id?: number): this;
    stop(id?: number): this;
    mute(muted?: boolean, id?: number): this;
    volume(volume?: number, id?: number): number | this;
    fade(from: number, to: number, duration: number, id?: number): this;
    rate(rate?: number, id?: number): number | this;
    seek(seek?: number, id?: number): number | this;
    loop(loop?: boolean, id?: number): boolean | this;
    state(): 'unloaded' | 'loading' | 'loaded';
    playing(id?: number): boolean;
    duration(id?: number): number;
    on(event: string, fn: Function, id?: number): this;
    once(event: string, fn: Function, id?: number): this;
    off(event: string, fn?: Function, id?: number): this;
    load(): this;
    unload(): void;
  }

  export const Howler: {
    mute(muted: boolean): typeof Howler;
    volume(volume?: number): number | typeof Howler;
    stop(): typeof Howler;
    unload(): typeof Howler;
    codecs(ext: string): boolean;
    ctx: AudioContext;
    masterGain: GainNode;
    noAudio: boolean;
    usingWebAudio: boolean;
    autoUnlock: boolean;
    html5PoolSize: number;
  };
}
