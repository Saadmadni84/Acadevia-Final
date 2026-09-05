import React, { useEffect, useMemo } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@/config/i18n.config';

import { googleTranslateService } from '@/services/googleTranslate.service';

const RTL_LANGUAGES = ['ur', 'ar', 'he', 'fa', 'sd'];

const LanguageDirectionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n: instance } = useTranslation();
  const language = instance.language;

  useEffect(() => {
    const lang = language?.split('-')[0] ?? 'en';
    const isRtl = RTL_LANGUAGES.includes(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language]);

  return <>{children}</>;
};

const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Google Translate & detect initial language
  useEffect(() => {
    googleTranslateService.init();

    const stored = localStorage.getItem('i18nextLng');
    if (!stored) {
      const browserLang = navigator.language?.split('-')[0] ?? 'en';
      i18n.changeLanguage(browserLang);
    }
  }, []);

  const provider = useMemo(
    () => (
      <I18nextProvider i18n={i18n}>
        <LanguageDirectionManager>{children}</LanguageDirectionManager>
      </I18nextProvider>
    ),
    [children],
  );

  return provider;
};

export { I18nProvider };
