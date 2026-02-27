package com.acadevia.sync.repository;

import com.acadevia.sync.entity.BandwidthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BandwidthLogRepository extends JpaRepository<BandwidthLog, Long> {
    
    @Query("SELECT AVG(b.throughputKbps) FROM BandwidthLog b WHERE b.userId = :userId AND b.periodStart > :since")
    Double getAverageBandwidth(@Param("userId") Long userId, @Param("since") java.time.LocalDateTime since);
}
