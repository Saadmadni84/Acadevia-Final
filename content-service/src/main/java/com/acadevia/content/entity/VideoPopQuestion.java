package com.acadevia.content.entity;

import com.acadevia.content.entity.enums.Difficulty;
import com.acadevia.content.entity.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_pop_questions", indexes = {
    @Index(name = "idx_vpq_video", columnList = "video_id"),
    @Index(name = "idx_vpq_timestamp", columnList = "video_id, timestamp_sec"),
    @Index(name = "idx_vpq_topic", columnList = "topic"),
    @Index(name = "idx_vpq_difficulty", columnList = "difficulty"),
    @Index(name = "idx_vpq_language", columnList = "language_code"),
    @Index(name = "idx_vpq_active", columnList = "is_active")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoPopQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", insertable = false, updatable = false)
    private Long videoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "timestamp_sec", nullable = false)
    private Integer timestampSec;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", length = 20)
    @Builder.Default
    private QuestionType questionType = QuestionType.MCQ;

    @Column(name = "option_a", length = 500)
    private String optionA;

    @Column(name = "option_b", length = 500)
    private String optionB;

    @Column(name = "option_c", length = 500)
    private String optionC;

    @Column(name = "option_d", length = 500)
    private String optionD;

    @Column(name = "correct_answer", length = 500, nullable = false)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 5;

    @Column(name = "language_code", length = 20)
    @Builder.Default
    private String languageCode = "en";

    @Column(length = 100)
    private String topic;

    @Column(length = 200)
    private String concept;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    @Builder.Default
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = false;

    @Column(name = "pause_video")
    @Builder.Default
    private Boolean pauseVideo = true;

    @Column(name = "time_limit_sec")
    @Builder.Default
    private Integer timeLimitSec = 30;

    @Column(name = "allow_skip")
    @Builder.Default
    private Boolean allowSkip = true;

    @Column(name = "show_explanation")
    @Builder.Default
    private Boolean showExplanation = true;

    @Column(name = "total_attempts")
    @Builder.Default
    private Integer totalAttempts = 0;

    @Column(name = "correct_count")
    @Builder.Default
    private Integer correctCount = 0;

    @Column(name = "accuracy_pct")
    @Builder.Default
    private Double accuracyPct = 0.0;

    @Column(name = "avg_time_sec")
    @Builder.Default
    private Double avgTimeSec = 0.0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
