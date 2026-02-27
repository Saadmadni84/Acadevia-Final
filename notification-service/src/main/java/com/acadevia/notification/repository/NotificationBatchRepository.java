package com.acadevia.notification.repository;

import com.acadevia.notification.entity.NotificationBatch;
import com.acadevia.notification.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationBatchRepository extends JpaRepository<NotificationBatch, Long> {
    List<NotificationBatch> findByStatusAndScheduledAtBefore(NotificationStatus status, LocalDateTime time);
    
    List<NotificationBatch> findByStatus(NotificationStatus status);
}
