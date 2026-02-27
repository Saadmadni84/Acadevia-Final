package com.acadevia.course.repository;

import com.acadevia.course.entity.CourseFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseFavoriteRepository extends JpaRepository<CourseFavorite, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<CourseFavorite> findByUserIdAndCourseId(Long userId, Long courseId);

    Page<CourseFavorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
