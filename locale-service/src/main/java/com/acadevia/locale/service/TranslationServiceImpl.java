package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.BulkTranslationRequest;
import com.acadevia.locale.dto.request.CreateTranslationRequest;
import com.acadevia.locale.dto.response.MissingTranslationsResponse;
import com.acadevia.locale.dto.response.TranslationBundleResponse;
import com.acadevia.locale.entity.Language;
import com.acadevia.locale.entity.Translation;
import com.acadevia.locale.entity.TranslationKey;
import com.acadevia.locale.enums.TextDirection;
import com.acadevia.locale.enums.TranslationCategory;
import com.acadevia.locale.enums.TranslationStatus;
import com.acadevia.locale.repository.LanguageRepository;
import com.acadevia.locale.repository.TranslationKeyRepository;
import com.acadevia.locale.repository.TranslationRepository;
import com.acadevia.locale.util.ScriptDetector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationServiceImpl implements TranslationService {

    private final TranslationRepository translationRepo;
    private final TranslationKeyRepository keyRepo;
    private final LanguageRepository languageRepo;
    private final FallbackResolverService fallbackResolver;

    @Override
    public String getTranslation(String keyName, String languageCode, String stateCode, Map<String, String> variables) {
        return fallbackResolver.resolve(keyName, languageCode, stateCode, variables);
    }

    @Override
    @Cacheable(value = "translationBundle", key = "#languageCode")
    public TranslationBundleResponse getTranslationBundle(String languageCode) {
        Language language = languageRepo.findByCode(languageCode)
                .orElseThrow(() -> new RuntimeException("Language not found: " + languageCode));

        List<Translation> translations = translationRepo.findAllByLanguageCode(languageCode);

        Map<String, String> translationMap = new LinkedHashMap<>();
        for (Translation t : translations) {
            translationMap.put(t.getTranslationKey().getKeyName(), t.getTranslatedText());
        }

        // Fill missing keys with English defaults
        List<TranslationKey> allKeys = keyRepo.findAll();
        for (TranslationKey key : allKeys) {
            translationMap.putIfAbsent(key.getKeyName(), key.getDefaultValue());
        }

        return TranslationBundleResponse.builder()
                .languageCode(languageCode)
                .languageName(language.getName())
                .nativeName(language.getNativeName())
                .direction(language.getDirection())
                .fontFamily(ScriptDetector.getFontFamily(languageCode))
                .translations(translationMap)
                .totalKeys(translationMap.size())
                .generatedAt(LocalDateTime.now().toString())
                .build();
    }

    @Override
    @Cacheable(value = "translationBundleCategory", key = "#languageCode + ':' + #category")
    public TranslationBundleResponse getTranslationBundleByCategory(String languageCode, String category) {
        Language language = languageRepo.findByCode(languageCode)
                .orElseThrow(() -> new RuntimeException("Language not found: " + languageCode));

        TranslationCategory cat = TranslationCategory.valueOf(category.toUpperCase());
        List<Translation> translations = translationRepo.findByLanguageCodeAndCategory(languageCode, cat);

        Map<String, String> translationMap = new LinkedHashMap<>();
        for (Translation t : translations) {
            translationMap.put(t.getTranslationKey().getKeyName(), t.getTranslatedText());
        }

        // Fill missing with defaults
        List<TranslationKey> categoryKeys = keyRepo.findByCategory(cat);
        for (TranslationKey key : categoryKeys) {
            translationMap.putIfAbsent(key.getKeyName(), key.getDefaultValue());
        }

        return TranslationBundleResponse.builder()
                .languageCode(languageCode)
                .languageName(language.getName())
                .nativeName(language.getNativeName())
                .direction(language.getDirection())
                .fontFamily(ScriptDetector.getFontFamily(languageCode))
                .translations(translationMap)
                .totalKeys(translationMap.size())
                .generatedAt(LocalDateTime.now().toString())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"translationBundle", "translationBundleCategory", "translationResolve", "languagePack"}, allEntries = true)
    public void createOrUpdateTranslation(CreateTranslationRequest request) {
        TranslationKey key = keyRepo.findByKeyName(request.getKeyName())
                .orElseThrow(() -> new RuntimeException("Translation key not found: " + request.getKeyName()));

        Language language = languageRepo.findByCode(request.getLanguageCode())
                .orElseThrow(() -> new RuntimeException("Language not found: " + request.getLanguageCode()));

        Translation translation = translationRepo
                .findByKeyNameAndLanguageCode(request.getKeyName(), request.getLanguageCode())
                .orElse(Translation.builder()
                        .translationKey(key)
                        .language(language)
                        .build());

        translation.setTranslatedText(request.getTranslatedText());
        translation.setStatus(TranslationStatus.PUBLISHED);

        translationRepo.save(translation);
        updateLanguageCompletion(request.getLanguageCode());

        log.info("Translation saved: key={}, lang={}", request.getKeyName(), request.getLanguageCode());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"translationBundle", "translationBundleCategory", "translationResolve", "languagePack"}, allEntries = true)
    public void bulkCreateTranslations(BulkTranslationRequest request) {
        Language language = languageRepo.findByCode(request.getLanguageCode())
                .orElseThrow(() -> new RuntimeException("Language not found: " + request.getLanguageCode()));

        int count = 0;
        for (Map.Entry<String, String> entry : request.getTranslations().entrySet()) {
            TranslationKey key = keyRepo.findByKeyName(entry.getKey()).orElse(null);
            if (key == null) {
                log.warn("Translation key not found, skipping: {}", entry.getKey());
                continue;
            }

            Translation translation = translationRepo
                    .findByKeyNameAndLanguageCode(entry.getKey(), request.getLanguageCode())
                    .orElse(Translation.builder()
                            .translationKey(key)
                            .language(language)
                            .build());

            translation.setTranslatedText(entry.getValue());
            translation.setStatus(TranslationStatus.PUBLISHED);

            translationRepo.save(translation);
            count++;
        }

        updateLanguageCompletion(request.getLanguageCode());
        log.info("Bulk translations saved: lang={}, count={}", request.getLanguageCode(), count);
    }

    @Override
    public MissingTranslationsResponse getMissingTranslations(String languageCode) {
        Language language = languageRepo.findByCode(languageCode)
                .orElseThrow(() -> new RuntimeException("Language not found: " + languageCode));

        List<TranslationKey> missing = translationRepo.findMissingKeys(languageCode);

        return MissingTranslationsResponse.builder()
                .languageCode(languageCode)
                .languageName(language.getName())
                .totalMissing(missing.size())
                .missingKeys(missing.stream()
                        .map(k -> MissingTranslationsResponse.MissingKey.builder()
                                .keyName(k.getKeyName())
                                .category(k.getCategory().name())
                                .defaultValue(k.getDefaultValue())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private void updateLanguageCompletion(String languageCode) {
        Language language = languageRepo.findByCode(languageCode).orElse(null);
        if (language == null) return;

        long totalKeys = keyRepo.count();
        long translatedKeys = translationRepo.countByLanguageCode(languageCode);

        language.setTotalKeys((int) totalKeys);
        language.setTranslatedKeys((int) translatedKeys);
        language.setCompletionPercent(totalKeys > 0 ? Math.round((double) translatedKeys / totalKeys * 10000.0) / 100.0 : 0.0);

        languageRepo.save(language);
    }
}
