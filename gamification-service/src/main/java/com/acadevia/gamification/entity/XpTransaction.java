package com.acadevia.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "xp_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XpTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "action_type", nullable = false)
    private String actionType; // e.g., 'QUIZ_COMPLETE'

    @Column(name = "source_id")
    private String sourceId; // Reference ID (Quiz ID, Course ID)

    @Column(columnDefinition = "json")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
