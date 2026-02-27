package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoBookmarkRepository extends JpaRepository<VideoBookmark, Long> {

    List<VideoBookmark> findByVideoIdAndUserIdOrderByTimestampSecAsc(Long videoId, Long userId);

    Page<VideoBookmark> findByUserId(Long userId, Pageable pageable);

    Page<VideoBookmark> findByUserIdAndVideoId(Long userId, Long videoId, Pageable pageable);

    @Query("SELECT b FROM VideoBookmark b WHERE b.userId = :userId AND b.isImportant = true ORDER BY b.createdAt DESC")
    List<VideoBookmark> findImportantByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM VideoBookmark b WHERE b.videoId = :videoId AND b.userId = :userId AND b.timestampSec BETWEEN :startSec AND :endSec ORDER BY b.timestampSec")
    List<VideoBookmark> findByVideoAndUserInTimestampRange(@Param("videoId") Long videoId, @Param("userId") Long userId, @Param("startSec") Integer startSec, @Param("endSec") Integer endSec);

    Long countByVideoIdAndUserId(Long videoId, Long userId);

    Long countByVideoId(Long videoId);

    Boolean existsByVideoIdAndUserIdAndTimestampSec(Long videoId, Long userId, Integer timestampSec);
}
