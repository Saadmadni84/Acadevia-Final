package com.acadevia.notification.service;

import com.acadevia.notification.dto.request.SendEmailRequest;
import com.acadevia.notification.dto.response.EmailStatusResponse;

import java.util.concurrent.CompletableFuture;

public interface EmailService {
    CompletableFuture<EmailStatusResponse> sendEmail(SendEmailRequest request);
    
    void sendWelcomeEmail(Long userId, String email, String name);
    
    void sendPasswordResetEmail(String email, String token);
    
    void sendSubscriptionConfirmation(Long userId, String email, String planName);
}
