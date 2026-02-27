package com.acadevia.content.entity;

import com.acadevia.content.entity.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_translations", indexes = {
    @Index(name = "idx_ct_content", columnList = "content_type, content_id"),
    @Index(name = "idx_ct_language", columnList = "language_code"),
    @Index(name = "idx_ct_content_lang", columnList = "content_type, content_id, language_code")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_content_translation", columnNames = {"content_type", "content_id", "field_name", "language_code"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ContentTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    private ContentType contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    @Column(name = "translated_value", nullable = false, columnDefinition = "TEXT")
    private String translatedValue;

    @Column(name = "is_auto_translated")
    @Builder.Default
    private Boolean isAutoTranslated = false;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verified_by")
    private Long verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
