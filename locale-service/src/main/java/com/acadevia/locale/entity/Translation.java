package com.acadevia.locale.entity;

import com.acadevia.locale.enums.TranslationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "translations", indexes = {
        @Index(name = "idx_t_key_lang", columnList = "keyId, languageId", unique = true),
        @Index(name = "idx_t_language", columnList = "languageId"),
        @Index(name = "idx_t_status", columnList = "status")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyId", nullable = false)
    private TranslationKey translationKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "languageId", nullable = false)
    private Language language;

    @Column(nullable = false, columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String translatedText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TranslationStatus status = TranslationStatus.DRAFT;

    @Column
    private Long translatedBy;

    @Column
    private Long verifiedBy;

    private LocalDateTime verifiedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
