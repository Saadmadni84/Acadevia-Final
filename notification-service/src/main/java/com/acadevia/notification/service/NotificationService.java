package com.acadevia.notification.service;

import com.acadevia.notification.dto.request.NotificationRequest;
import com.acadevia.notification.dto.response.NotificationResponse;
import com.acadevia.notification.dto.response.UnreadCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void sendNotification(NotificationRequest request);
    
    Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);
    
    UnreadCountResponse getUnreadCount(Long userId);
    
    void markAsRead(Long notificationId);
    
    void markAllAsRead(Long userId);
    
    void deleteNotification(Long notificationId);
}
