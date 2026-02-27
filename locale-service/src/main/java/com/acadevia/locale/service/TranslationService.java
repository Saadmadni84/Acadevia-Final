package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.BulkTranslationRequest;
import com.acadevia.locale.dto.request.CreateTranslationRequest;
import com.acadevia.locale.dto.response.MissingTranslationsResponse;
import com.acadevia.locale.dto.response.TranslationBundleResponse;

import java.util.Map;

public interface TranslationService {
    String getTranslation(String keyName, String languageCode, String stateCode, Map<String, String> variables);
    TranslationBundleResponse getTranslationBundle(String languageCode);
    TranslationBundleResponse getTranslationBundleByCategory(String languageCode, String category);
    void createOrUpdateTranslation(CreateTranslationRequest request);
    void bulkCreateTranslations(BulkTranslationRequest request);
    MissingTranslationsResponse getMissingTranslations(String languageCode);
}
