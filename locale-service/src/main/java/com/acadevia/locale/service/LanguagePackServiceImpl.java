package com.acadevia.locale.service;

import com.acadevia.locale.dto.response.LanguagePackResponse;
import com.acadevia.locale.entity.Language;
import com.acadevia.locale.entity.Translation;
import com.acadevia.locale.entity.TranslationKey;
import com.acadevia.locale.repository.LanguageRepository;
import com.acadevia.locale.repository.TranslationKeyRepository;
import com.acadevia.locale.repository.TranslationRepository;
import com.acadevia.locale.util.ScriptDetector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LanguagePackServiceImpl implements LanguagePackService {

    private final LanguageRepository languageRepo;
    private final TranslationRepository translationRepo;
    private final TranslationKeyRepository keyRepo;

    /**
     * Generate a complete language pack organized by category.
     * This is what the React frontend loads for i18n.
     *
     * Format:
     * {
     *   "UI_LABELS": { "landing.hero.title": "सीखो खेलकर", ... },
     *   "NOTIFICATIONS": { "notification.badge.unlocked": "...", ... },
     *   ...
     * }
     */
    @Override
    @Cacheable(value = "languagePack", key = "#languageCode")
    public LanguagePackResponse getLanguagePack(String languageCode) {
        Language language = languageRepo.findByCode(languageCode)
                .orElseThrow(() -> new RuntimeException("Language not found: " + languageCode));

        // Get all translations for this language
        List<Translation> translations = translationRepo.findAllByLanguageCode(languageCode);
        Map<String, String> translationMap = new HashMap<>();
        for (Translation t : translations) {
            translationMap.put(t.getTranslationKey().getKeyName(), t.getTranslatedText());
        }

        // Get all keys and organize by category
        List<TranslationKey> allKeys = keyRepo.findAll();
        Map<String, Map<String, String>> categorized = new LinkedHashMap<>();

        for (TranslationKey key : allKeys) {
            String category = key.getCategory().name();
            categorized.computeIfAbsent(category, k -> new LinkedHashMap<>());

            String value = translationMap.getOrDefault(key.getKeyName(), key.getDefaultValue());
            categorized.get(category).put(key.getKeyName(), value);
        }

        return LanguagePackResponse.builder()
                .languageCode(languageCode)
                .languageName(language.getName())
                .nativeName(language.getNativeName())
                .script(language.getScript())
                .direction(language.getDirection())
                .fontFamily(ScriptDetector.getFontFamily(languageCode))
                .categorizedTranslations(categorized)
                .totalKeys(allKeys.size())
                .completionPercent(language.getCompletionPercent())
                .version(String.valueOf(System.currentTimeMillis()))
                .generatedAt(LocalDateTime.now().toString())
                .build();
    }
}
