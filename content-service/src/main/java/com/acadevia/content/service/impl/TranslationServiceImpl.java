package com.acadevia.content.service.impl;

import com.acadevia.content.dto.request.TranslationCreateRequest;
import com.acadevia.content.dto.request.TranslationUpdateRequest;
import com.acadevia.content.dto.response.TranslationResponse;
import com.acadevia.content.entity.ContentTranslation;
import com.acadevia.content.entity.enums.ContentType;
import com.acadevia.content.exception.DuplicateResourceException;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.TranslationMapper;
import com.acadevia.content.repository.ContentTranslationRepository;
import com.acadevia.content.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TranslationServiceImpl implements TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationServiceImpl.class);

    private final ContentTranslationRepository translationRepository;
    private final TranslationMapper translationMapper;

    @Override
    @Transactional
    public TranslationResponse createTranslation(TranslationCreateRequest request) {
        ContentType contentType = ContentType.valueOf(request.getContentType());

        if (translationRepository.existsByContentTypeAndContentIdAndFieldNameAndLanguageCode(
                contentType, request.getContentId(), request.getFieldName(), request.getLanguageCode())) {
            throw new DuplicateResourceException("Translation already exists for this content field and language");
        }

        ContentTranslation translation = translationMapper.toEntity(request);
        ContentTranslation saved = translationRepository.save(translation);

        log.info("Translation created: id={}, contentType={}, contentId={}, lang={}",
                saved.getId(), request.getContentType(), request.getContentId(), request.getLanguageCode());
        return translationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TranslationResponse updateTranslation(Long translationId, TranslationUpdateRequest request) {
        ContentTranslation translation = findTranslationById(translationId);

        if (request.getTranslatedValue() != null) translation.setTranslatedValue(request.getTranslatedValue());
        if (request.getIsAutoTranslated() != null) translation.setIsAutoTranslated(request.getIsAutoTranslated());
        if (request.getIsVerified() != null) {
            translation.setIsVerified(request.getIsVerified());
            if (Boolean.TRUE.equals(request.getIsVerified()) && request.getVerifiedBy() != null) {
                translation.setVerifiedBy(request.getVerifiedBy());
                translation.setVerifiedAt(LocalDateTime.now());
            }
        }

        return translationMapper.toResponse(translationRepository.save(translation));
    }

    @Override
    public List<TranslationResponse> getTranslationsByContentAndLanguage(String contentType, Long contentId, String languageCode) {
        ContentType type = ContentType.valueOf(contentType);
        return translationMapper.toResponseList(translationRepository.findByContentTypeAndContentIdAndLanguageCode(type, contentId, languageCode));
    }

    @Override
    public List<TranslationResponse> getTranslationsByContent(String contentType, Long contentId) {
        ContentType type = ContentType.valueOf(contentType);
        return translationMapper.toResponseList(translationRepository.findByContentTypeAndContentId(type, contentId));
    }

    @Override
    public List<String> getAvailableLanguages(String contentType, Long contentId) {
        ContentType type = ContentType.valueOf(contentType);
        return translationRepository.findAvailableLanguages(type, contentId);
    }

    @Override
    @Transactional
    public void deleteTranslation(Long translationId) {
        ContentTranslation translation = findTranslationById(translationId);
        translationRepository.delete(translation);
    }

    @Override
    @Transactional
    public TranslationResponse verifyTranslation(Long translationId, Long verifiedBy) {
        ContentTranslation translation = findTranslationById(translationId);
        translation.setIsVerified(true);
        translation.setVerifiedBy(verifiedBy);
        translation.setVerifiedAt(LocalDateTime.now());
        return translationMapper.toResponse(translationRepository.save(translation));
    }

    private ContentTranslation findTranslationById(Long translationId) {
        return translationRepository.findById(translationId)
                .orElseThrow(() -> new ResourceNotFoundException("Translation", "id", translationId));
    }
}
