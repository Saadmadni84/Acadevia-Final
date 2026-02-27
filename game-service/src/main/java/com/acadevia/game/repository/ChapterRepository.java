package com.acadevia.game.repository;

import com.acadevia.game.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubjectCodeAndClassGradeOrderBySequenceOrderAsc(String subjectCode, Integer classGrade);
    List<Chapter> findBySubjectIdAndClassGradeOrderBySequenceOrderAsc(Long subjectId, Integer classGrade);
}
