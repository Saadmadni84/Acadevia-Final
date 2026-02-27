package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.CreateLanguageRequest;
import com.acadevia.locale.dto.response.LanguageDetailResponse;
import com.acadevia.locale.dto.response.LanguageResponse;
import com.acadevia.locale.dto.response.TranslationStatsResponse;
import com.acadevia.locale.entity.Language;
import com.acadevia.locale.enums.LanguagePhase;
import com.acadevia.locale.enums.TextDirection;
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

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LanguageServiceImpl implements LanguageService {

    private final LanguageRepository languageRepo;
    private final TranslationKeyRepository keyRepo;
    private final TranslationRepository translationRepo;
    private final FallbackResolverService fallbackResolver;

    @Override
    @Cacheable(value = "activeLanguages", key = "'list'")
    public List<LanguageResponse> getActiveLanguages() {
        return languageRepo.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<LanguageResponse> getAllLanguages() {
        return languageRepo.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public LanguageDetailResponse getLanguageDetail(String code) {
        Language lang = languageRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Language not found: " + code));

        List<Object[]> categoryBreakdown = keyRepo.countByCategory();
        Map<String, Integer> categoryMap = new HashMap<>();
        for (Object[] row : categoryBreakdown) {
            categoryMap.put(row[0].toString(), ((Long) row[1]).intValue());
        }

        return LanguageDetailResponse.builder()
                .id(lang.getId()).code(lang.getCode()).name(lang.getName())
                .nativeName(lang.getNativeName()).script(lang.getScript())
                .direction(lang.getDirection()).fontFamily(lang.getFontFamily())
                .phase(lang.getPhase()).isActive(lang.getIsActive())
                .totalKeys(lang.getTotalKeys()).translatedKeys(lang.getTranslatedKeys())
                .completionPercent(lang.getCompletionPercent())
                .categoryBreakdown(categoryMap)
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeLanguages", allEntries = true)
    public LanguageResponse createLanguage(CreateLanguageRequest request) {
        if (languageRepo.existsByCode(request.getCode())) {
            throw new RuntimeException("Language already exists: " + request.getCode());
        }

        Language lang = Language.builder()
                .code(request.getCode())
                .name(request.getName())
                .nativeName(request.getNativeName())
                .script(request.getScript() != null ? request.getScript() : ScriptDetector.getScript(request.getCode()))
                .direction(request.getDirection() != null ? request.getDirection() : ScriptDetector.getDirection(request.getCode()))
                .fontFamily(request.getFontFamily() != null ? request.getFontFamily() : ScriptDetector.getFontFamily(request.getCode()))
                .phase(request.getPhase() != null ? LanguagePhase.valueOf(request.getPhase()) : LanguagePhase.PHASE_3)
                .isActive(true)
                .build();

        lang = languageRepo.save(lang);
        log.info("Language created: {} ({})", lang.getName(), lang.getCode());
        return toResponse(lang);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeLanguages", allEntries = true)
    public LanguageResponse toggleLanguage(String code, Boolean isActive) {
        Language lang = languageRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Language not found: " + code));
        lang.setIsActive(isActive);
        lang = languageRepo.save(lang);
        return toResponse(lang);
    }

    @Override
    @Cacheable(value = "translationStats", key = "'global'")
    public TranslationStatsResponse getStats() {
        List<Language> languages = languageRepo.findAll();
        long totalKeys = keyRepo.count();

        List<TranslationStatsResponse.LanguageCompletion> completions = languages.stream()
                .map(l -> TranslationStatsResponse.LanguageCompletion.builder()
                        .code(l.getCode()).name(l.getName()).nativeName(l.getNativeName())
                        .totalKeys(l.getTotalKeys()).translatedKeys(l.getTranslatedKeys())
                        .completionPercent(l.getCompletionPercent())
                        .build())
                .sorted(Comparator.comparingDouble(TranslationStatsResponse.LanguageCompletion::getCompletionPercent).reversed())
                .collect(Collectors.toList());

        double overallCompletion = completions.stream()
                .mapToDouble(TranslationStatsResponse.LanguageCompletion::getCompletionPercent)
                .average().orElse(0);

        List<Object[]> catCounts = keyRepo.countByCategory();
        Map<String, Integer> categoryMap = new LinkedHashMap<>();
        for (Object[] row : catCounts) {
            categoryMap.put(row[0].toString(), ((Long) row[1]).intValue());
        }

        return TranslationStatsResponse.builder()
                .totalLanguages(languages.size())
                .activeLanguages((int) languages.stream().filter(Language::getIsActive).count())
                .totalTranslationKeys((int) totalKeys)
                .overallCompletion(Math.round(overallCompletion * 100.0) / 100.0)
                .languageCompletions(completions)
                .categoryKeyCount(categoryMap)
                .build();
    }

    @Override
    public String getDefaultLanguageForState(String stateCode) {
        return fallbackResolver.getDefaultLanguageForState(stateCode);
    }

    private LanguageResponse toResponse(Language l) {
        return LanguageResponse.builder()
                .id(l.getId()).code(l.getCode()).name(l.getName())
                .nativeName(l.getNativeName()).script(l.getScript())
                .direction(l.getDirection()).fontFamily(l.getFontFamily())
                .isActive(l.getIsActive()).completionPercent(l.getCompletionPercent())
                .build();
    }
}
