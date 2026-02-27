package com.acadevia.notification.repository;

import com.acadevia.notification.entity.EmailLog;
import com.acadevia.notification.enums.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByStatus(EmailStatus status);
    
    List<EmailLog> findByRecipientAndSentAtAfter(String recipient, LocalDateTime date);
    
    long countByStatusAndSentAtBetween(EmailStatus status, LocalDateTime start, LocalDateTime end);
}
