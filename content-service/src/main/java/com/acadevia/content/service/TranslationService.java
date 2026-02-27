package com.acadevia.content.service;

import com.acadevia.content.dto.request.TranslationCreateRequest;
import com.acadevia.content.dto.request.TranslationUpdateRequest;
import com.acadevia.content.dto.response.TranslationResponse;

import java.util.List;

public interface TranslationService {

    TranslationResponse createTranslation(TranslationCreateRequest request);

    TranslationResponse updateTranslation(Long translationId, TranslationUpdateRequest request);

    List<TranslationResponse> getTranslationsByContentAndLanguage(String contentType, Long contentId, String languageCode);

    List<TranslationResponse> getTranslationsByContent(String contentType, Long contentId);

    List<String> getAvailableLanguages(String contentType, Long contentId);

    void deleteTranslation(Long translationId);

    TranslationResponse verifyTranslation(Long translationId, Long verifiedBy);
}
