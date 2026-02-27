package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {
    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
