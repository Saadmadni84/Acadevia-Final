package com.acadevia.notification.entity;

import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationChannel;
import com.acadevia.notification.enums.NotificationPriority;
import com.acadevia.notification.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_read", columnList = "userId, isRead"),
        @Index(name = "idx_user_category", columnList = "userId, category"),
        @Index(name = "idx_user_created", columnList = "userId, createdAt"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "createdAt")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NotificationChannel channel = NotificationChannel.IN_APP;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(length = 500)
    private String actionUrl;

    @Column(length = 500)
    private String iconUrl;

    @Column(length = 100)
    private String sourceEvent;

    @Column
    private Long sourceId;

    @Column(columnDefinition = "JSON")
    private String metadataJson;

    @Column(length = 10)
    @Builder.Default
    private String languageCode = "en";

    @Column(name = "retry_count")
    @Builder.Default
    private int retryCount = 0;

    private LocalDateTime readAt;

    private LocalDateTime sentAt;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
