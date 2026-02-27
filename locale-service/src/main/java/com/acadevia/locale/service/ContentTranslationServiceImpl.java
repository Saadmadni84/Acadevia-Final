package com.acadevia.locale.service;

import com.acadevia.locale.dto.request.ContentTranslationRequest;
import com.acadevia.locale.dto.response.ContentTranslationResponse;
import com.acadevia.locale.entity.ContentTranslation;
import com.acadevia.locale.entity.Language;
import com.acadevia.locale.enums.ContentType;
import com.acadevia.locale.enums.TranslationStatus;
import com.acadevia.locale.repository.ContentTranslationRepository;
import com.acadevia.locale.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentTranslationServiceImpl implements ContentTranslationService {

    private final ContentTranslationRepository contentTransRepo;
    private final LanguageRepository languageRepo;

    @Override
    @Cacheable(value = "contentTranslation", key = "#contentType + ':' + #contentId + ':' + #languageCode")
    public ContentTranslationResponse getContentTranslation(ContentType contentType, Long contentId, String languageCode) {
        return contentTransRepo.findByContentAndLanguage(contentType, contentId, languageCode)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    public List<ContentTranslationResponse> getAllTranslationsForContent(ContentType contentType, Long contentId) {
        return contentTransRepo.findByContent(contentType, contentId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "contentTranslation", key = "#request.contentType + ':' + #request.contentId + ':' + #request.languageCode")
    public ContentTranslationResponse createOrUpdateContentTranslation(ContentTranslationRequest request) {
        Language language = languageRepo.findByCode(request.getLanguageCode())
                .orElseThrow(() -> new RuntimeException("Language not found: " + request.getLanguageCode()));

        ContentTranslation ct = contentTransRepo
                .findByContentAndLanguage(request.getContentType(), request.getContentId(), request.getLanguageCode())
                .orElse(ContentTranslation.builder()
                        .contentType(request.getContentType())
                        .contentId(request.getContentId())
                        .language(language)
                        .build());

        if (request.getTranslatedTitle() != null) ct.setTranslatedTitle(request.getTranslatedTitle());
        if (request.getTranslatedDescription() != null) ct.setTranslatedDescription(request.getTranslatedDescription());
        if (request.getTranslatedContent() != null) ct.setTranslatedContent(request.getTranslatedContent());
        ct.setStatus(TranslationStatus.PUBLISHED);

        ct = contentTransRepo.save(ct);
        log.info("Content translation saved: type={}, id={}, lang={}",
                request.getContentType(), request.getContentId(), request.getLanguageCode());

        return toResponse(ct);
    }

    private ContentTranslationResponse toResponse(ContentTranslation ct) {
        return ContentTranslationResponse.builder()
                .id(ct.getId())
                .contentType(ct.getContentType())
                .contentId(ct.getContentId())
                .languageCode(ct.getLanguage().getCode())
                .languageName(ct.getLanguage().getName())
                .translatedTitle(ct.getTranslatedTitle())
                .translatedDescription(ct.getTranslatedDescription())
                .translatedContent(ct.getTranslatedContent())
                .status(ct.getStatus())
                .build();
    }
}
