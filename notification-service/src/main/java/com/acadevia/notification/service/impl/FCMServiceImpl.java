package com.acadevia.notification.service.impl;

import com.acadevia.notification.dto.request.NotificationRequest;
import com.acadevia.notification.dto.request.RegisterDeviceRequest;
import com.acadevia.notification.entity.DeviceToken;
import com.acadevia.notification.repository.DeviceTokenRepository;
import com.acadevia.notification.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class FCMServiceImpl implements PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Override
    public void sendPushNotification(NotificationRequest request) {
        log.info("Sending PUSH notification to user {}", request.getRecipientId());
        // Mock implementation
    }

    @Override
    public void registerDevice(RegisterDeviceRequest request) {
        deviceTokenRepository.findByToken(request.getDeviceToken())
                .ifPresentOrElse(
                        token -> {
                            token.setUserId(request.getUserId());
                            token.setLastUsedAt(LocalDateTime.now());
                            deviceTokenRepository.save(token);
                        },
                        () -> {
                            DeviceToken newToken = DeviceToken.builder()
                                    .userId(request.getUserId())
                                    .token(request.getDeviceToken())
                                    .platform(request.getDeviceType()) // Mapped from deviceType request
                                    .isActive(true)
                                    .build();
                            deviceTokenRepository.save(newToken);
                        }
                );
    }

    @Override
    public void unregisterDevice(String token) {
        deviceTokenRepository.deleteByToken(token);
    }
}
