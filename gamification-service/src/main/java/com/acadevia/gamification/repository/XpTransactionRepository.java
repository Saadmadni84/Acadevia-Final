package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.XpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface XpTransactionRepository extends JpaRepository<XpTransaction, UUID> {
    
    // Count actions of a specific type today for a user
    long countByUserIdAndActionTypeAndCreatedAtBetween(String userId, String actionType, LocalDateTime start, LocalDateTime end);
    
    // Check if duplicate action (e.g., first_time rule)
    boolean existsByUserIdAndActionType(String userId, String actionType);
}
