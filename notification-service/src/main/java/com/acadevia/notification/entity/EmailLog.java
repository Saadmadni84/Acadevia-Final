package com.acadevia.notification.entity;

import com.acadevia.notification.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs", indexes = {
        @Index(name = "idx_email_user", columnList = "userId"),
        @Index(name = "idx_email_status", columnList = "status"),
        @Index(name = "idx_email_created", columnList = "createdAt")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String toEmail;

    @Column(length = 255)
    private String recipient;

    @Column(nullable = false, length = 300)
    private String subject;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String htmlBody;

    @Column(length = 100)
    private String templateName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EmailStatus status = EmailStatus.QUEUED;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column
    private Integer retryCount;

    private LocalDateTime sentAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
