package com.acadevia.admin.service;

import com.acadevia.admin.dto.response.AuditLogResponse;
import com.acadevia.admin.entity.AuditLog;
import com.acadevia.admin.enums.AuditAction;
import com.acadevia.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditRepo;

    @Override
    @Async
    public void log(Long adminUserId, String adminEmail, AuditAction action,
                    String targetType, Long targetId, String description,
                    String beforeJson, String afterJson, String ipAddress, String userAgent) {

        AuditLog audit = AuditLog.builder()
                .adminUserId(adminUserId)
                .adminEmail(adminEmail)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .description(description)
                .beforeJson(beforeJson)
                .afterJson(afterJson)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        auditRepo.save(audit);
        log.info("AUDIT: {} by {} - {} (target: {}:{})",
                action, adminEmail, description, targetType, targetId);
    }

    @Override
    public Page<AuditLogResponse> getAuditLogs(int page, int size) {
        return auditRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Override
    public Page<AuditLogResponse> getAuditLogsByAdmin(Long adminUserId, int page, int size) {
        return auditRepo.findByAdminUserIdOrderByCreatedAtDesc(adminUserId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Override
    public Page<AuditLogResponse> getAuditLogsByAction(AuditAction action, int page, int size) {
        return auditRepo.findByActionOrderByCreatedAtDesc(action, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .adminEmail(a.getAdminEmail())
                .action(a.getAction())
                .targetType(a.getTargetType())
                .targetId(a.getTargetId())
                .description(a.getDescription())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
