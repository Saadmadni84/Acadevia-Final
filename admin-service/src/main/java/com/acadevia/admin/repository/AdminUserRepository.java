package com.acadevia.admin.repository;
import com.acadevia.admin.entity.AdminUser;
import com.acadevia.admin.enums.AdminRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByUserId(Long userId);
    Optional<AdminUser> findByEmail(String email);
    List<AdminUser> findByAdminRole(AdminRole role);
    List<AdminUser> findBySchoolId(String schoolId);
    boolean existsByUserId(Long userId);
}
