package com.acadevia.admin.repository;
import com.acadevia.admin.entity.BulkOperation;
import com.acadevia.admin.enums.BulkOperationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface BulkOperationRepository extends JpaRepository<BulkOperation, Long> {
    Page<BulkOperation> findByInitiatedByOrderByCreatedAtDesc(Long adminId, Pageable pageable);
    List<BulkOperation> findByStatus(BulkOperationStatus status);
}
