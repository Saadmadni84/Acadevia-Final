package com.acadevia.leaderboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_leaderboard_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLeaderboardProfile {

    @Id
    @Column(length = 36)
    private String userId;

    private String username;
    private String avatarUrl;

    @Column(length = 50)
    private String schoolId;

    @Column(length = 20)
    private String grade;

    @Column(length = 2)
    private String countryCode; // ISO 3166-1 alpha-2

    @Column(length = 50)
    private String state;

    @Column(length = 50)
    private String city;

    private long totalXpAllTime;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    @Version
    private Long version;
}
