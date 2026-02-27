package com.acadevia.locale.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "language_state_mappings", indexes = {
        @Index(name = "idx_lsm_state", columnList = "stateCode", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LanguageStateMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String stateCode;

    @Column(nullable = false, length = 100)
    private String stateName;

    @Column(nullable = false, length = 10)
    private String primaryLanguageCode;

    @Column(length = 50)
    private String secondaryLanguageCodes;

    @Column(length = 10)
    @Builder.Default
    private String officialLanguageCode = "en";
}
