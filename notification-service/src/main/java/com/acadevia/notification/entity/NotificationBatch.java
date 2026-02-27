package com.acadevia.notification.entity;

import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_batches", indexes = {
        @Index(name = "idx_batch_status", columnList = "status"),
        @Index(name = "idx_batch_scheduled", columnList = "scheduledAt")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationCategory category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetCriteria;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalRecipients = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer sentCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    private LocalDateTime scheduledAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Column
    private Long createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
