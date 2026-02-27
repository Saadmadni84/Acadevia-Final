package com.acadevia.admin.repository;
import com.acadevia.admin.entity.AuditLog;
import com.acadevia.admin.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByAdminUserIdOrderByCreatedAtDesc(Long adminUserId, Pageable pageable);
    Page<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action, Pageable pageable);
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();
    @Query("SELECT a FROM AuditLog a WHERE a.targetType = :type AND a.targetId = :id ORDER BY a.createdAt DESC")
    List<AuditLog> findByTarget(@Param("type") String type, @Param("id") Long id);
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :before")
    int deleteOlderThan(@Param("before") LocalDateTime before);
}
