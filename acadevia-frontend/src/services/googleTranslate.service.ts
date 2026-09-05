/**
 * Google Translate Service for Acadevia
 * Dynamically loads and controls Google Website Translator for all Indian Languages
 * Includes safe React DOM reconciler patching to prevent removeChild/insertBefore crashes
 */

// Global type declarations for Google Translate
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

class GoogleTranslateService {
  private initialized = false;
  private currentLanguage = 'en';
  private listeners = new Set<(lang: string) => void>();

  constructor() {
    this.patchReactDomReconciler();
  }

  /**
   * Monkey-patch Node.prototype methods so that React's DOM reconciler
   * does not crash when Google Translate wraps text nodes into <font> tags.
   */
  private patchReactDomReconciler() {
    if (typeof window === 'undefined') return;

    try {
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child.parentNode !== this) {
          return child;
        }
        return originalRemoveChild.apply(this, [child]) as T;
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) {
          return newNode;
        }
        return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
      };
    } catch (e) {
      console.warn('[GoogleTranslate] DOM reconciler patch error:', e);
    }
  }

  /**
   * Initializes the Google Translate script and DOM elements.
   */
  public init() {
    if (typeof window === 'undefined' || this.initialized) return;

    // Read stored language from cookie or localStorage
    const savedCookie = this.getCookie('googtrans');
    if (savedCookie) {
      const parts = savedCookie.split('/');
      const code = parts[parts.length - 1];
      if (code) {
        this.currentLanguage = code;
      }
    }

    // Ensure hidden container exists
    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }

    // Define the global callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages:
                'en,hi,bn,te,ta,mr,gu,kn,ml,pa,or,as,ur,sa,ne,mai,bho,kok,sd,dog,mni-Mtei,lus',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            'google_translate_element'
          );

          // If a language was previously chosen and differs from en, apply it once element is ready
          if (this.currentLanguage && this.currentLanguage !== 'en') {
            this.applyLanguageToCombo(this.currentLanguage);
          }
        }
      } catch (err) {
        console.warn('[GoogleTranslate] Initialization error:', err);
      }
    };

    // Inject the script if not present
    const SCRIPT_ID = 'google-translate-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    this.initialized = true;
  }

  /**
   * Changes the active language dynamically across the entire website.
   */
  public changeLanguage(langCode: string) {
    this.currentLanguage = langCode;

    // Update googtrans cookies
    const cookieVal = `/auto/${langCode}`;
    const host = window.location.hostname;

    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;

    // Try apex domain if domain contains multiple dots
    const domainParts = host.split('.');
    if (domainParts.length > 2) {
      const apex = `.${domainParts.slice(-2).join('.')}`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${apex};`;
    }

    // Attempt to trigger the Google Translate select dropdown
    const applied = this.applyLanguageToCombo(langCode);

    if (!applied) {
      // Retry for up to 2 seconds if script is still loading
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (this.applyLanguageToCombo(langCode) || attempts > 20) {
          clearInterval(interval);
          if (attempts > 20 && langCode !== 'en') {
            // As a graceful fallback if Google Translate is slow to inject the combo, reload to activate cookie
            window.location.reload();
          }
        }
      }, 100);
    }

    // Notify listeners
    this.notifyListeners(langCode);
  }

  /**
   * Resets language back to original English
   */
  public resetToEnglish() {
    this.changeLanguage('en');
  }

  /**
   * Internal helper to find .goog-te-combo and dispatch change
   */
  private applyLanguageToCombo(langCode: string): boolean {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public subscribe(listener: (lang: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(lang: string) {
    this.listeners.forEach((fn) => {
      try {
        fn(lang);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
}

export const googleTranslateService = new GoogleTranslateService();
export default googleTranslateService;
