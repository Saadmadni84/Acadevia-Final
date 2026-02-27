package com.acadevia.sync.service;

import com.acadevia.sync.entity.SyncConflict;
import com.acadevia.sync.enums.ConflictResolutionStrategy;
import com.acadevia.sync.enums.SyncEntityType;
import com.acadevia.sync.repository.SyncConflictRepository;
import com.acadevia.sync.strategy.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ConflictResolutionService {

    private final SyncConflictRepository conflictRepository;
    private final MergeStrategy mergeStrategy;
    private final LastWriteWinsStrategy lastWriteWinsStrategy;
    private final ServerWinsStrategy serverWinsStrategy;
    private final ClientWinsStrategy clientWinsStrategy;
    private final ManualResolutionStrategy manualResolutionStrategy;

    public ConflictStrategy determineAutoStrategy(SyncEntityType entityType) {
        return switch (entityType) {
            case XP_TRANSACTION, LESSON_PROGRESS, COURSE_PROGRESS, BADGE_EARNED -> mergeStrategy;
            case QUIZ_ATTEMPT, VIDEO_WATCH_EVENT, POPUP_QUESTION_ANSWER -> lastWriteWinsStrategy;
            case STREAK_UPDATE, WALLET_TRANSACTION -> serverWinsStrategy;
            case GAME_PROGRESS, USER_PREFERENCE -> clientWinsStrategy;
            case NOTE, BOOKMARK -> manualResolutionStrategy;
            default -> serverWinsStrategy; // Safe default
        };
    }

    public SyncConflict createConflict(Long userId, SyncEntityType type, String serverPayload, String clientPayload) {
        // ... logic to persist conflict
        return new SyncConflict(); // Stub
    }

    public String resolve(SyncConflict conflict) {
         // This would select strategy based on entity type and execute
         return determineAutoStrategy(conflict.getEntityType()).resolve(conflict);
    }
}
