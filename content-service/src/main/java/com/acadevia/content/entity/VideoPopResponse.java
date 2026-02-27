package com.acadevia.content.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_pop_responses",
    uniqueConstraints = @UniqueConstraint(name = "uk_pop_response", columnNames = {"pop_question_id", "user_id"}),
    indexes = {
        @Index(name = "idx_vpr_user", columnList = "user_id"),
        @Index(name = "idx_vpr_video", columnList = "video_id"),
        @Index(name = "idx_vpr_question", columnList = "pop_question_id"),
        @Index(name = "idx_vpr_correct", columnList = "is_correct")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoPopResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pop_question_id", insertable = false, updatable = false)
    private Long popQuestionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pop_question_id", nullable = false)
    private VideoPopQuestion popQuestion;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    @Column(name = "selected_answer", length = 500, nullable = false)
    private String selectedAnswer;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "time_taken_sec")
    @Builder.Default
    private Integer timeTakenSec = 0;

    @Column(name = "xp_earned")
    @Builder.Default
    private Integer xpEarned = 0;

    @Column(name = "hint_used")
    @Builder.Default
    private Boolean hintUsed = false;

    @Column(name = "attempt_number")
    @Builder.Default
    private Integer attemptNumber = 1;

    @Column(name = "answered_at")
    @Builder.Default
    private LocalDateTime answeredAt = LocalDateTime.now();
}
