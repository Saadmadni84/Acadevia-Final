package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoNoteRepository extends JpaRepository<VideoNote, Long> {

    List<VideoNote> findByVideoIdAndUserIdOrderByTimestampSecAsc(Long videoId, Long userId);

    Page<VideoNote> findByUserId(Long userId, Pageable pageable);

    Page<VideoNote> findByUserIdAndVideoId(Long userId, Long videoId, Pageable pageable);

    @Query("SELECT n FROM VideoNote n WHERE n.userId = :userId AND n.isPinned = true ORDER BY n.createdAt DESC")
    List<VideoNote> findPinnedByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM VideoNote n WHERE n.videoId = :videoId AND n.userId = :userId AND n.timestampSec BETWEEN :startSec AND :endSec ORDER BY n.timestampSec")
    List<VideoNote> findByVideoAndUserInTimestampRange(@Param("videoId") Long videoId, @Param("userId") Long userId, @Param("startSec") Integer startSec, @Param("endSec") Integer endSec);

    @Query("SELECT n FROM VideoNote n WHERE n.userId = :userId AND n.content LIKE %:keyword% ORDER BY n.createdAt DESC")
    List<VideoNote> searchByUserAndKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    Long countByVideoIdAndUserId(Long videoId, Long userId);

    Long countByVideoId(Long videoId);
}
