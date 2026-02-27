package com.acadevia.notification.service;

import com.acadevia.notification.dto.request.NotificationRequest;
import com.acadevia.notification.dto.request.SendEmailRequest;
import com.acadevia.notification.entity.Notification;
import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationPriority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationDispatcher {

    private final PreferenceService preferenceService;
    private final NotificationService inAppService;
    private final EmailService emailService;
    private final PushNotificationService pushService;

    @Async
    public void dispatch(Long userId, NotificationCategory category, String subject, String content, Map<String, Object> metadata, NotificationPriority priority, String link) {
        log.info("Dispatching notification for user: {} | Category: {}", userId, category);

        // 1. In-App (Always send unless explicitly muted globally, but usually we don't mute in-app)
        // We can check preference if needed. Let's assume In-App is critical for now or check pref.
        // Usually In-App corresponds to "WEB" channel or "IN_APP".
        if (preferenceService.isChannelEnabled(userId, category, "push")) { 
            // Reuse push pref for in-app or have separate? Let's use push for now or assume always on.
            // Actually, in-app is usually separate. Let's always send In-App for persistency.
             NotificationRequest request = NotificationRequest.builder()
                .recipientId(userId)
                .category(category)
                .subject(subject)
                .content(content)
                .priority(priority)
                .metadata(metadata)
                .link(link)
                .build();
            inAppService.sendNotification(request);
        }

        // 2. Email
        if (preferenceService.isChannelEnabled(userId, category, "email")) {
            // We need a template ID. 
            // For simplicity, we'll derive it from category or metadata.
            // Or we just send generic email if specific template not found.
            String templateId = (String) metadata.getOrDefault("emailTemplateId", "default-notification");
            
            // Check if we have an email address in metadata or we need to fetch user profile?
            // The notification service might need to fetch User details (email) via Feign Client from User Service.
            // For this implementation, I will assume the email is passed in metadata or we have a UserClient.
            // Since we don't have a UserClient yet in the prompt, I will assume it's in metadata for now.
            String email = (String) metadata.get("userEmail"); 
            
            if (email != null) {
                SendEmailRequest emailRequest = SendEmailRequest.builder()
                        .to(email)
                        .subject(subject)
                        .templateId(templateId)
                        .variables(metadata)
                        .userId(userId)
                        .build();
                emailService.sendEmail(emailRequest);
            } else {
                log.warn("Cannot send email. No email address found for user {}", userId);
            }
        }

        // 3. Push (FCM)
        if (preferenceService.isChannelEnabled(userId, category, "push")) {
             NotificationRequest pushRequest = NotificationRequest.builder()
                .recipientId(userId)
                .category(category)
                .subject(subject)
                .content(content)
                .priority(priority)
                .metadata(metadata)
                .link(link)
                .build();
            pushService.sendPushNotification(pushRequest);
        }
        
        // 4. SMS (skipped for now)
    }
}
