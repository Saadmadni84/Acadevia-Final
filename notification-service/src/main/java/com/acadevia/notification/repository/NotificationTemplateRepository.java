package com.acadevia.notification.repository;

import com.acadevia.notification.entity.NotificationTemplate;
import com.acadevia.notification.enums.NotificationChannel;
import com.acadevia.notification.enums.NotificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByTemplateKeyAndLanguageCode(String templateKey, String languageCode);
    
    // Fallback to default language 'en' if specific language not found
    Optional<NotificationTemplate> findByTemplateKeyAndLanguageCodeAndIsActiveTrue(String templateKey, String languageCode);
    
    List<NotificationTemplate> findByCategoryAndIsActiveTrue(NotificationCategory category);
}
