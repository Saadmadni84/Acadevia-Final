package com.acadevia.locale.repository;
import com.acadevia.locale.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    @Query("SELECT t FROM Translation t WHERE t.translationKey.keyName = :keyName AND t.language.code = :langCode")
    Optional<Translation> findByKeyNameAndLanguageCode(@Param("keyName") String keyName, @Param("langCode") String langCode);

    @Query("SELECT t FROM Translation t JOIN FETCH t.translationKey WHERE t.language.code = :langCode")
    List<Translation> findAllByLanguageCode(@Param("langCode") String langCode);

    @Query("SELECT t FROM Translation t JOIN FETCH t.translationKey WHERE t.language.code = :langCode AND t.translationKey.category = :category")
    List<Translation> findByLanguageCodeAndCategory(@Param("langCode") String langCode, @Param("category") com.acadevia.locale.enums.TranslationCategory category);

    @Query("SELECT COUNT(t) FROM Translation t WHERE t.language.code = :langCode")
    Long countByLanguageCode(@Param("langCode") String langCode);

    @Query("SELECT tk FROM com.acadevia.locale.entity.TranslationKey tk WHERE tk.id NOT IN " +
            "(SELECT t.translationKey.id FROM Translation t WHERE t.language.code = :langCode)")
    List<com.acadevia.locale.entity.TranslationKey> findMissingKeys(@Param("langCode") String langCode);
}
