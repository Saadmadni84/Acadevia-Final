import { describe, it, expect, beforeEach, vi } from 'vitest';
import { googleTranslateService } from '@/services/googleTranslate.service';
import { SUPPORTED_LANGUAGES } from '@/config/app.config';

describe('Google Translate & Indian Languages Service', () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  });

  it('contains all 22 official/major Indian languages in SUPPORTED_LANGUAGES', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi'); // Hindi
    expect(codes).toContain('bn'); // Bengali
    expect(codes).toContain('te'); // Telugu
    expect(codes).toContain('ta'); // Tamil
    expect(codes).toContain('mr'); // Marathi
    expect(codes).toContain('gu'); // Gujarati
    expect(codes).toContain('kn'); // Kannada
    expect(codes).toContain('ml'); // Malayalam
    expect(codes).toContain('pa'); // Punjabi
    expect(codes).toContain('or'); // Odia
    expect(codes).toContain('as'); // Assamese
    expect(codes).toContain('ur'); // Urdu
    expect(codes).toContain('sa'); // Sanskrit
    expect(codes).toContain('ne'); // Nepali
    expect(codes).toContain('mai'); // Maithili
    expect(codes).toContain('bho'); // Bhojpuri
    expect(codes).toContain('kok'); // Konkani
    expect(codes).toContain('sd'); // Sindhi
    expect(codes).toContain('dog'); // Dogri
    expect(codes).toContain('mni-Mtei'); // Manipuri
    expect(codes).toContain('lus'); // Mizo
  });

  it('updates language and googtrans cookie when changeLanguage is called', () => {
    googleTranslateService.changeLanguage('hi');
    expect(googleTranslateService.getCurrentLanguage()).toBe('hi');
    expect(document.cookie).toContain('googtrans=/auto/hi');
  });

  it('can reset language back to English', () => {
    googleTranslateService.changeLanguage('ta');
    expect(googleTranslateService.getCurrentLanguage()).toBe('ta');
    googleTranslateService.resetToEnglish();
    expect(googleTranslateService.getCurrentLanguage()).toBe('en');
    expect(document.cookie).toContain('googtrans=/auto/en');
  });

  it('notifies subscribers on language change', () => {
    const listener = vi.fn();
    const unsub = googleTranslateService.subscribe(listener);

    googleTranslateService.changeLanguage('bn');
    expect(listener).toHaveBeenCalledWith('bn');

    unsub();
  });
});
