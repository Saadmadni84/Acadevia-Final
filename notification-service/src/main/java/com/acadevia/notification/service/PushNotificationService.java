package com.acadevia.notification.service;

import com.acadevia.notification.dto.request.NotificationRequest;
import com.acadevia.notification.dto.request.RegisterDeviceRequest;

public interface PushNotificationService {
    void sendPushNotification(NotificationRequest request);
    
    void registerDevice(RegisterDeviceRequest request);
    
    void unregisterDevice(String token);
}
