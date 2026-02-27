package com.acadevia.notification.entity;

import com.acadevia.notification.enums.NotificationCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_templates", indexes = {
        @Index(name = "idx_template_key_lang", columnList = "templateKey, languageCode", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String templateKey;

    @Column(nullable = false, length = 10)
    private String languageCode;

    @Column(nullable = false, length = 300)
    private String titleTemplate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationCategory category;

    @Column(length = 500)
    private String iconUrl;

    @Column(length = 500)
    private String actionUrlTemplate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
