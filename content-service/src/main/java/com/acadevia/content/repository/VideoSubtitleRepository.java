package com.acadevia.content.repository;

import com.acadevia.content.entity.VideoSubtitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoSubtitleRepository extends JpaRepository<VideoSubtitle, Long> {

    List<VideoSubtitle> findByVideoIdAndIsActiveTrue(Long videoId);

    Optional<VideoSubtitle> findByVideoIdAndLanguageCode(Long videoId, String languageCode);

    Optional<VideoSubtitle> findByVideoIdAndIsDefaultTrueAndIsActiveTrue(Long videoId);

    Boolean existsByVideoIdAndLanguageCode(Long videoId, String languageCode);

    Long countByVideoIdAndIsActiveTrue(Long videoId);
}
