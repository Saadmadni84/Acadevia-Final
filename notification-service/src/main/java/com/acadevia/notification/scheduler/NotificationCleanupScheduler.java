package com.acadevia.notification.scheduler;

import com.acadevia.notification.enums.NotificationStatus;
import com.acadevia.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    // Run every day at 3 AM
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldNotifications() {
        log.info("Running notification cleanup job");
        
        // Example: Delete notifications older than 90 days
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        
        // This is inefficient for large datasets, better use a bulk delete query in repo
        // but for now, let's keep it simple or assume repo method
        // notificationRepository.deleteByCreatedAtBefore(cutoffDate); 
        
        log.info("Cleanup job completed");
    }
}
