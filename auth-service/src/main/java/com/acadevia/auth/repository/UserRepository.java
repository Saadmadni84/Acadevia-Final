package com.acadevia.auth.repository;

import com.acadevia.auth.entity.User;
import com.acadevia.auth.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByStudentSchoolId(String studentSchoolId);

    Boolean existsByEmail(String email);

    Boolean existsByStudentSchoolIdAndSchoolId(String studentSchoolId, Long schoolId);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    List<User> findBySchoolIdAndRole(Long schoolId, Role role);

    @Query("SELECT u FROM User u WHERE u.schoolId = :schoolId AND u.classGrade = :classGrade")
    List<User> findBySchoolIdAndClassGrade(@Param("schoolId") Long schoolId, @Param("classGrade") Integer classGrade);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.email = :email")
    void incrementFailedLoginAttempts(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0 WHERE u.email = :email")
    void resetFailedLoginAttempts(@Param("email") String email);

    @Modifying
    @Query("UPDATE User u SET u.lockedUntil = :lockedUntil WHERE u.email = :email")
    void lockAccount(@Param("email") String email, @Param("lockedUntil") LocalDateTime lockedUntil);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("loginTime") LocalDateTime loginTime);
}
