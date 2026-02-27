package com.acadevia.locale.entity;

import com.acadevia.locale.enums.LanguagePhase;
import com.acadevia.locale.enums.TextDirection;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "languages", indexes = {
        @Index(name = "idx_lang_code", columnList = "code", unique = true),
        @Index(name = "idx_lang_active", columnList = "isActive")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String nativeName;

    @Column(length = 50)
    private String script;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    @Builder.Default
    private TextDirection direction = TextDirection.LTR;

    @Column(length = 200)
    private String fontFamily;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private LanguagePhase phase = LanguagePhase.PHASE_1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalKeys = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer translatedKeys = 0;

    @Column(nullable = false)
    @Builder.Default
    private Double completionPercent = 0.0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
