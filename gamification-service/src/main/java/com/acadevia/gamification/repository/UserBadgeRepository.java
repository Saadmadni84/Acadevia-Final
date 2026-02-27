package com.acadevia.gamification.repository;

import com.acadevia.gamification.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    boolean existsByUserIdAndBadgeId(String userId, UUID badgeId);
    List<UserBadge> findByUserId(String userId);
}
