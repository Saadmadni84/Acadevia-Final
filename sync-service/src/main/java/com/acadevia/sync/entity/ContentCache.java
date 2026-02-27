package com.acadevia.sync.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_cache")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentCache {
    /**
     * Stores metadata about content available on CDN/S3 for downloads.
     * Prevents needing to query Course/Content Service constantly.
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String contentId;

    private String s3Url;
    private Long fileSize;
    private String checksum;
    private String mimeType;
    
    // For versioning content updates (e.g. video updated)
    private String version;

    private LocalDateTime lastRefreshed;
}
