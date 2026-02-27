package com.acadevia.game.repository;

import com.acadevia.game.entity.ConceptMastery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConceptMasteryRepository extends JpaRepository<ConceptMastery, Long> {
    Optional<ConceptMastery> findByUserIdAndConceptId(Long userId, Long conceptId);
    List<ConceptMastery> findByUserIdAndChapterId(Long userId, Long chapterId);
    List<ConceptMastery> findByUserIdAndSubjectIdAndClassGrade(Long userId, Long subjectId, Integer classGrade);
}
