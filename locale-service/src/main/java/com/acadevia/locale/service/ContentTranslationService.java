package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.ContentTranslationRequest;
import com.acadevia.locale.dto.response.ContentTranslationResponse;
import com.acadevia.locale.enums.ContentType;

import java.util.List;

public interface ContentTranslationService {
    ContentTranslationResponse getContentTranslation(ContentType contentType, Long contentId, String languageCode);
    List<ContentTranslationResponse> getAllTranslationsForContent(ContentType contentType, Long contentId);
    ContentTranslationResponse createOrUpdateContentTranslation(ContentTranslationRequest request);
}
