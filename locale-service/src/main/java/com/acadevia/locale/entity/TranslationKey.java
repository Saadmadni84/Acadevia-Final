package com.acadevia.locale.entity;

import com.acadevia.locale.enums.TranslationCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "translation_keys", indexes = {
        @Index(name = "idx_tk_key", columnList = "keyName", unique = true),
        @Index(name = "idx_tk_category", columnList = "category")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TranslationKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String keyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TranslationCategory category;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String defaultValue;

    @Column(length = 500)
    private String context;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxLength = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
