package com.acadevia.admin.repository;
import com.acadevia.admin.entity.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Long> {
    @Query("SELECT a FROM SystemAnnouncement a WHERE a.isActive = true " +
            "AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.isPinned DESC, a.createdAt DESC")
    List<SystemAnnouncement> findActiveAnnouncements(LocalDateTime now);
}
