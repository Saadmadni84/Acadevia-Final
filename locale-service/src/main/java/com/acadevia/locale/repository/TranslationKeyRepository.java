package com.acadevia.locale.repository;
import com.acadevia.locale.entity.TranslationKey;
import com.acadevia.locale.enums.TranslationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface TranslationKeyRepository extends JpaRepository<TranslationKey, Long> {
    Optional<TranslationKey> findByKeyName(String keyName);
    List<TranslationKey> findByCategory(TranslationCategory category);
    boolean existsByKeyName(String keyName);
    @Query("SELECT tk.category, COUNT(tk) FROM TranslationKey tk GROUP BY tk.category")
    List<Object[]> countByCategory();
}
