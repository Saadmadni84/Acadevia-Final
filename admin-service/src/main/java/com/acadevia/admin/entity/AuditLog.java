package com.acadevia.admin.entity;

import com.acadevia.admin.enums.AuditAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_admin", columnList = "adminUserId"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_created", columnList = "createdAt"),
        @Index(name = "idx_audit_target", columnList = "targetType, targetId")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long adminUserId;

    @Column(length = 200)
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AuditAction action;

    @Column(length = 50)
    private String targetType;

    @Column
    private Long targetId;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "JSON")
    private String beforeJson;

    @Column(columnDefinition = "JSON")
    private String afterJson;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
