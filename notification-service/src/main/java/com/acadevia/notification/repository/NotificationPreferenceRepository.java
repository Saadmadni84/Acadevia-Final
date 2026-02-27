package com.acadevia.notification.repository;

import com.acadevia.notification.entity.NotificationPreference;
import com.acadevia.notification.enums.NotificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserIdAndCategory(Long userId, NotificationCategory category);
    
    List<NotificationPreference> findByUserId(Long userId);
    
    // Check if preference exists, if not, we assume default enabled.
    boolean existsByUserIdAndCategory(Long userId, NotificationCategory category);
}
