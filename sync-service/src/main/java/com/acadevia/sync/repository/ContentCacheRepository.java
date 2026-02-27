package com.acadevia.sync.repository;

import com.acadevia.sync.entity.ContentCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContentCacheRepository extends JpaRepository<ContentCache, Long> {
    Optional<ContentCache> findByContentId(String contentId);
}
