package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.CreateLanguageRequest;
import com.acadevia.locale.dto.response.LanguageDetailResponse;
import com.acadevia.locale.dto.response.LanguageResponse;
import com.acadevia.locale.dto.response.TranslationStatsResponse;

import java.util.List;

public interface LanguageService {
    List<LanguageResponse> getActiveLanguages();
    List<LanguageResponse> getAllLanguages();
    LanguageDetailResponse getLanguageDetail(String code);
    LanguageResponse createLanguage(CreateLanguageRequest request);
    LanguageResponse toggleLanguage(String code, Boolean isActive);
    TranslationStatsResponse getStats();
    String getDefaultLanguageForState(String stateCode);
}
