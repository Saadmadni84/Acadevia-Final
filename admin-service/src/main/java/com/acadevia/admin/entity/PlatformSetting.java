package com.acadevia.admin.entity;

import com.acadevia.admin.enums.SettingCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "platform_settings", indexes = {
        @Index(name = "idx_setting_key", columnList = "settingKey", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlatformSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String settingKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String settingValue;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SettingCategory category;

    @Column(length = 50)
    private String valueType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEditable = true;

    @Column
    private Long updatedBy;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
