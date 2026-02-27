package com.acadevia.content.repository;

import com.acadevia.content.entity.ContentTranslation;
import com.acadevia.content.entity.enums.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentTranslationRepository extends JpaRepository<ContentTranslation, Long> {

    List<ContentTranslation> findByContentTypeAndContentIdAndLanguageCode(ContentType contentType, Long contentId, String languageCode);

    Optional<ContentTranslation> findByContentTypeAndContentIdAndFieldNameAndLanguageCode(ContentType contentType, Long contentId, String fieldName, String languageCode);

    List<ContentTranslation> findByContentTypeAndContentId(ContentType contentType, Long contentId);

    @Query("SELECT DISTINCT t.languageCode FROM ContentTranslation t WHERE t.contentType = :contentType AND t.contentId = :contentId")
    List<String> findAvailableLanguages(@Param("contentType") ContentType contentType, @Param("contentId") Long contentId);

    @Query("SELECT t FROM ContentTranslation t WHERE t.contentType = :contentType AND t.contentId = :contentId AND t.isVerified = false")
    List<ContentTranslation> findUnverifiedTranslations(@Param("contentType") ContentType contentType, @Param("contentId") Long contentId);

    Boolean existsByContentTypeAndContentIdAndFieldNameAndLanguageCode(ContentType contentType, Long contentId, String fieldName, String languageCode);

    Long countByContentTypeAndContentIdAndLanguageCode(ContentType contentType, Long contentId, String languageCode);
}
