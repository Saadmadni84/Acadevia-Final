package com.acadevia.leaderboard.repository;

import com.acadevia.leaderboard.entity.LeaderboardSnapshot;
import com.acadevia.leaderboard.enums.GeoScope;
import com.acadevia.leaderboard.enums.SubjectScope;
import com.acadevia.leaderboard.enums.TimeScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardSnapshotRepository extends JpaRepository<LeaderboardSnapshot, Long> {

    @Query("SELECT s FROM LeaderboardSnapshot s WHERE s.timeScope = :timeScope AND s.geoScope = :geoScope AND s.scopeValue = :scopeValue AND s.date = :date")
    List<LeaderboardSnapshot> findSnapshots(TimeScope timeScope, GeoScope geoScope, String scopeValue, LocalDate date);

    Optional<LeaderboardSnapshot> findByTimeScopeAndGeoScopeAndScopeValueAndSubjectAndDate(
            TimeScope timeScope, GeoScope geoScope, String scopeValue, SubjectScope subject, LocalDate date);
}
