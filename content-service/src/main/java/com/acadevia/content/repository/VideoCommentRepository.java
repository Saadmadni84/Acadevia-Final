package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoCommentRepository extends JpaRepository<VideoComment, Long> {

    List<VideoComment> findByVideoIdOrderByCreatedAtDesc(Long videoId);

    long countByVideoId(Long videoId);

    void deleteByVideoId(Long videoId);

    @Query("SELECT c FROM VideoComment c JOIN Video v ON c.videoId = v.id WHERE v.createdBy = :teacherId ORDER BY c.createdAt DESC")
    List<VideoComment> findCommentsForTeacher(@Param("teacherId") Long teacherId);

    @Query("SELECT c FROM VideoComment c ORDER BY c.createdAt DESC")
    List<VideoComment> findAllCommentsOrderByCreatedAtDesc();
}
