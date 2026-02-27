package com.acadevia.locale.repository;
import com.acadevia.locale.entity.ContentTranslation;
import com.acadevia.locale.enums.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface ContentTranslationRepository extends JpaRepository<ContentTranslation, Long> {
    @Query("SELECT ct FROM ContentTranslation ct WHERE ct.contentType = :type AND ct.contentId = :id AND ct.language.code = :langCode")
    Optional<ContentTranslation> findByContentAndLanguage(@Param("type") ContentType type, @Param("id") Long id, @Param("langCode") String langCode);

    @Query("SELECT ct FROM ContentTranslation ct WHERE ct.contentType = :type AND ct.contentId = :id")
    List<ContentTranslation> findByContent(@Param("type") ContentType type, @Param("id") Long id);

    @Query("SELECT ct FROM ContentTranslation ct WHERE ct.language.code = :langCode AND ct.contentType = :type")
    List<ContentTranslation> findByLanguageAndType(@Param("langCode") String langCode, @Param("type") ContentType type);
}
