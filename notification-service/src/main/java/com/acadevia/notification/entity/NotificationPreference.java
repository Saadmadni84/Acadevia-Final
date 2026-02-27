package com.acadevia.notification.entity;

import com.acadevia.notification.enums.NotificationCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences", indexes = {
        @Index(name = "idx_user_category", columnList = "userId, category", unique = true)
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationCategory category;

    @Column(nullable = false)
    @Builder.Default
    private boolean inAppEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean smsEnabled = false;

    // Optional: Quiet hours (could be on SYSTEM category or duplicated)
    @Column(length = 5)
    @Builder.Default
    private String quietHoursStart = "22:00";

    @Column(length = 5)
    @Builder.Default
    private String quietHoursEnd = "07:00";

    @Column(length = 10)
    @Builder.Default
    private String preferredLanguage = "en";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
