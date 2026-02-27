package com.acadevia.notification.service.impl;

import com.acadevia.notification.dto.request.SendEmailRequest;
import com.acadevia.notification.dto.response.EmailStatusResponse;
import com.acadevia.notification.entity.EmailLog;
import com.acadevia.notification.enums.EmailStatus;
import com.acadevia.notification.repository.EmailLogRepository;
import com.acadevia.notification.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;

    @Override
    @Async
    public CompletableFuture<EmailStatusResponse> sendEmail(SendEmailRequest request) {
        EmailLog emailLog = EmailLog.builder()
                .toEmail(request.getTo())
                .subject(request.getSubject())
                .templateName(request.getTemplateId())
                .htmlBody("") 
                .status(EmailStatus.QUEUED)
                .retryCount(0)
                .userId(request.getUserId() != null ? request.getUserId() : 0L)
                .build();
        
        emailLog = emailLogRepository.save(emailLog);

        try {
            Context context = new Context();
            if (request.getVariables() != null) {
                context.setVariables(request.getVariables());
            }
            
            String htmlBody = templateEngine.process(request.getTemplateId(), context);
            emailLog.setHtmlBody(htmlBody);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(htmlBody, true);
            
            mailSender.send(message);

            emailLog.setStatus(EmailStatus.SENT);
            emailLog.setSentAt(LocalDateTime.now());
            emailLogRepository.save(emailLog);

            return CompletableFuture.completedFuture(
                EmailStatusResponse.builder()
                    .id(emailLog.getId())
                    .recipient(request.getTo())
                    .status(EmailStatus.SENT)
                    .sentAt(LocalDateTime.now())
                    .build()
            );

        } catch (MessagingException e) {
            log.error("Failed to send email to {}", request.getTo(), e);
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
            
            return CompletableFuture.completedFuture(
                EmailStatusResponse.builder()
                    .id(emailLog.getId())
                    .recipient(request.getTo())
                    .status(EmailStatus.FAILED)
                    .errorMessage(e.getMessage())
                    .build()
            );
        }
    }

    @Override
    public void sendWelcomeEmail(Long userId, String email, String name) {
        SendEmailRequest request = SendEmailRequest.builder()
                .to(email)
                .subject("Welcome to Acadevia!")
                .templateId("email/welcome")
                .variables(java.util.Map.of("name", name))
                .userId(userId)
                .build();
        sendEmail(request);
    }

    @Override
    public void sendPasswordResetEmail(String email, String token) {
        SendEmailRequest request = SendEmailRequest.builder()
                .to(email)
                .subject("Password Reset Request")
                .templateId("email/password-reset")
                .variables(java.util.Map.of("token", token))
                .userId(0L)
                .build();
        sendEmail(request);
    }

    @Override
    public void sendSubscriptionConfirmation(Long userId, String email, String planName) {
        SendEmailRequest request = SendEmailRequest.builder()
                .to(email)
                .subject("Subscription Confirmed")
                .templateId("email/subscription-confirmed")
                .variables(java.util.Map.of("planName", planName))
                .userId(userId)
                .build();
        sendEmail(request);
    }
}
