package com.acadevia.quiz.dto.response;

import com.acadevia.quiz.entity.enums.MultiplayerMode;
import com.acadevia.quiz.entity.enums.SessionStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MultiplayerSessionResponse {
    private Long id;
    private Long quizId;
    private Long hostUserId;
    private String sessionCode;
    private MultiplayerMode mode;
    private SessionStatus status;
    
    private Integer maxParticipants;
    private Integer currentParticipants;
    private Integer entryFee;
    private Boolean isPrivate;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private List<Long> participantUserIds;
}
