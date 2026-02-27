package com.acadevia.locale.repository;
import com.acadevia.locale.entity.LanguageStateMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface LanguageStateMappingRepository extends JpaRepository<LanguageStateMapping, Long> {
    Optional<LanguageStateMapping> findByStateCode(String stateCode);
}
