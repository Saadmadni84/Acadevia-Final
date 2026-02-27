package com.acadevia.locale.repository;
import com.acadevia.locale.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    Optional<Language> findByCode(String code);
    List<Language> findByIsActiveTrueOrderByNameAsc();
    boolean existsByCode(String code);
}
