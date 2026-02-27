package com.acadevia.notification.service.impl;

import com.acadevia.notification.dto.request.NotificationRequest;
import com.acadevia.notification.dto.response.NotificationResponse;
import com.acadevia.notification.dto.response.UnreadCountResponse;
import com.acadevia.notification.entity.Notification;
import com.acadevia.notification.enums.NotificationStatus;
import com.acadevia.notification.repository.NotificationRepository;
import com.acadevia.notification.service.NotificationService;
import com.acadevia.notification.service.UnreadCountService;
import com.acadevia.notification.util.NotificationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class InAppNotificationService implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UnreadCountService unreadCountService;

    @Override
    @Transactional
    public void sendNotification(NotificationRequest request) {
        log.info("Saving in-app notification for user: {}", request.getRecipientId());
        
        Notification notification = Notification.builder()
                .userId(request.getRecipientId())
                .title(request.getSubject())
                .message(request.getContent())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(NotificationStatus.SENT)
                .metadataJson(NotificationUtils.convertMetadataToJson(request.getMetadata()))
                .actionUrl(request.getLink())
                .isRead(false)
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Push via WebSocket
        messagingTemplate.convertAndSendToUser(
                String.valueOf(request.getRecipientId()),
                "/queue/notifications",
                convertToResponse(saved)
        );
        
        unreadCountService.increment(request.getRecipientId());
    }

    @Override
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public UnreadCountResponse getUnreadCount(Long userId) {
        long count = unreadCountService.get(userId);
        return new UnreadCountResponse(userId, count);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (!notification.isRead()) {
                notification.setRead(true);
                notification.setReadAt(java.time.LocalDateTime.now());
                notificationRepository.save(notification);
                unreadCountService.reset(notification.getUserId());
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdAndIsReadFalse(userId).forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(java.time.LocalDateTime.now());
        });
        notificationRepository.saveAll(notificationRepository.findByUserIdAndIsReadFalse(userId));
        
        unreadCountService.reset(userId);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationUtils.toResponse(notification);
    }
}
