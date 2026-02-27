package com.acadevia.admin.dto.response;
import com.acadevia.admin.enums.BulkOperationStatus;
import com.acadevia.admin.enums.BulkOperationType;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BulkOperationResponse {
    private Long id;
    private BulkOperationType operationType;
    private String fileName;
    private Integer totalRecords;
    private Integer processedRecords;
    private Integer successRecords;
    private Integer failedRecords;
    private BulkOperationStatus status;
    private Double progressPercent;
    private String resultFileUrl;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
