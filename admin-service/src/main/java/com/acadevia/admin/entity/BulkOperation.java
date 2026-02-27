package com.acadevia.admin.entity;

import com.acadevia.admin.enums.BulkOperationStatus;
import com.acadevia.admin.enums.BulkOperationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bulk_operations", indexes = {
        @Index(name = "idx_bo_status", columnList = "status"),
        @Index(name = "idx_bo_admin", columnList = "initiatedBy")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BulkOperation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private BulkOperationType operationType;

    @Column(length = 500)
    private String fileName;

    @Builder.Default private Integer totalRecords = 0;
    @Builder.Default private Integer processedRecords = 0;
    @Builder.Default private Integer successRecords = 0;
    @Builder.Default private Integer failedRecords = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    @Builder.Default
    private BulkOperationStatus status = BulkOperationStatus.PENDING;

    @Column(columnDefinition = "LONGTEXT")
    private String errorLog;

    @Column(length = 500)
    private String resultFileUrl;

    @Column(nullable = false)
    private Long initiatedBy;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
