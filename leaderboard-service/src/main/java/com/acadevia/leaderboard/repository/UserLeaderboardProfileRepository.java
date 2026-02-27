package com.acadevia.leaderboard.repository;

import com.acadevia.leaderboard.entity.UserLeaderboardProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLeaderboardProfileRepository extends JpaRepository<UserLeaderboardProfile, String> {
    Optional<UserLeaderboardProfile> findByUserId(String userId);
}
