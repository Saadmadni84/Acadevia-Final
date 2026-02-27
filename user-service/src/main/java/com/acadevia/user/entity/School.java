package com.acadevia.user.entity;

import com.acadevia.user.entity.enums.Board;
import com.acadevia.user.entity.enums.Medium;
import com.acadevia.user.entity.enums.SchoolType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "schools")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_local", length = 500)
    private String nameLocal;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(length = 100)
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Board board;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Medium medium;

    @Column(name = "medium_language", length = 50)
    private String mediumLanguage;

    @Enumerated(EnumType.STRING)
    @Column(name = "school_type")
    @Builder.Default
    private SchoolType schoolType = SchoolType.PRIVATE;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 10)
    private String pincode;

    @Column(length = 20)
    private String phone;

    private String email;
    private String website;

    @Column(name = "principal_name", length = 200)
    private String principalName;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(name = "udise_code", length = 20)
    private String udiseCode;

    @Column(name = "affiliation_no", length = 50)
    private String affiliationNo;

    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;

    @Column(name = "total_teachers")
    @Builder.Default
    private Integer totalTeachers = 0;

    @Column(name = "total_classrooms")
    @Builder.Default
    private Integer totalClassrooms = 0;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "registered_by")
    private Long registeredBy;

    @CreatedDate
    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "school")
    private List<Classroom> classrooms;
}
