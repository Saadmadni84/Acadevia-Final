CREATE TABLE multiplayer_participants (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id          BIGINT NOT NULL,
    user_id             BIGINT NOT NULL,
    
    -- Display
    display_name        VARCHAR(100),
    avatar_url          VARCHAR(500),
    
    -- Scoring
    score               INT DEFAULT 0,
    correct_answers     INT DEFAULT 0,
    wrong_answers       INT DEFAULT 0,
    total_time_sec      INT DEFAULT 0,
    rank_position       INT,
    
    -- XP
    xp_earned           INT DEFAULT 0,
    credits_earned      INT DEFAULT 0,
    
    -- Status
    is_ready            BOOLEAN DEFAULT FALSE,
    is_connected        BOOLEAN DEFAULT TRUE,
    is_finished         BOOLEAN DEFAULT FALSE,
    
    joined_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at         TIMESTAMP NULL,
    
    FOREIGN KEY (session_id) REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_user (session_id, user_id),
    INDEX idx_mp_session (session_id),
    INDEX idx_mp_user (user_id),
    INDEX idx_mp_score (session_id, score DESC)
);
