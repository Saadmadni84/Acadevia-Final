package com.acadevia.admin.service;

import com.acadevia.admin.dto.response.AuditLogResponse;
import com.acadevia.admin.enums.AuditAction;
import org.springframework.data.domain.Page;

public interface AuditService {
    void log(Long adminUserId, String adminEmail, AuditAction action,
             String targetType, Long targetId, String description,
             String beforeJson, String afterJson, String ipAddress, String userAgent);

    Page<AuditLogResponse> getAuditLogs(int page, int size);
    Page<AuditLogResponse> getAuditLogsByAdmin(Long adminUserId, int page, int size);
    Page<AuditLogResponse> getAuditLogsByAction(AuditAction action, int page, int size);
}
