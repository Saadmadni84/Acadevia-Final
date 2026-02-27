package com.acadevia.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "states")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class State {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_local", length = 200)
    private String nameLocal;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "default_language", nullable = false, length = 20)
    @Builder.Default
    private String defaultLanguage = "hi";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Region region;

    @Column(name = "is_union_territory")
    @Builder.Default
    private Boolean isUnionTerritory = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "state")
    private List<City> cities;

    public enum Region {
        NORTH, SOUTH, EAST, WEST, CENTRAL, NORTHEAST
    }
}
