package com.acadevia.locale.entity;

import com.acadevia.locale.enums.ContentType;
import com.acadevia.locale.enums.TranslationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_translations", indexes = {
        @Index(name = "idx_ct_content_lang", columnList = "contentType, contentId, languageId", unique = true),
        @Index(name = "idx_ct_content", columnList = "contentType, contentId"),
        @Index(name = "idx_ct_language", columnList = "languageId")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContentTranslation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentType contentType;

    @Column(nullable = false)
    private Long contentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "languageId", nullable = false)
    private Language language;

    @Column(length = 500, columnDefinition = "VARCHAR(500) CHARACTER SET utf8mb4")
    private String translatedTitle;

    @Column(columnDefinition = "TEXT CHARACTER SET utf8mb4")
    private String translatedDescription;

    @Column(columnDefinition = "LONGTEXT CHARACTER SET utf8mb4")
    private String translatedContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TranslationStatus status = TranslationStatus.DRAFT;

    @Column
    private Long translatedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
