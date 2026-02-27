package com.acadevia.locale.service;

import com.acadevia.locale.dto.response.LanguagePackResponse;

public interface LanguagePackService {
    LanguagePackResponse getLanguagePack(String languageCode);
}
