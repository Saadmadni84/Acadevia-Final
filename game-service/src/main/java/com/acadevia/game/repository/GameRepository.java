package com.acadevia.game.repository;

import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.enums.GameDifficulty;
import com.acadevia.game.entity.enums.GameType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByConceptIdAndIsActiveTrue(Long conceptId);
    List<Game> findByChapterIdAndIsActiveTrue(Long chapterId);
    List<Game> findBySubjectCodeAndClassGradeAndIsActiveTrue(String subjectCode, Integer classGrade);
    
    @Query("SELECT g FROM Game g WHERE " +
           "(:subject IS NULL OR g.subject.code = :subject) AND " +
           "(:classGrade IS NULL OR g.classGrade = :classGrade) AND " +
           "(:gameType IS NULL OR g.gameType = :gameType) AND " +
           "(:difficulty IS NULL OR g.difficulty = :difficulty) AND " +
           "(:query IS NULL OR g.title LIKE %:query% OR g.description LIKE %:query% OR g.topic LIKE %:query%) AND " +
           "g.isActive = true")
    Page<Game> searchGames(@Param("query") String query, 
                           @Param("gameType") GameType gameType, 
                           @Param("subject") String subject, 
                           @Param("classGrade") Integer classGrade, 
                           @Param("difficulty") GameDifficulty difficulty, 
                           Pageable pageable);

    List<Game> findByClassGradeAndIsFeaturedTrueAndIsActiveTrue(Integer classGrade);
    
    @Query(value = "SELECT * FROM games g WHERE g.class_grade = :classGrade AND g.is_active = true ORDER BY g.total_plays DESC LIMIT :limit", nativeQuery = true)
    List<Game> findPopularGames(@Param("classGrade") Integer classGrade, @Param("limit") int limit);

    List<Game> findTop10ByIsActiveTrueOrderByTotalPlaysDesc();

    List<Game> findTop10ByIsActiveTrueOrderByCreatedAtDesc();
}
