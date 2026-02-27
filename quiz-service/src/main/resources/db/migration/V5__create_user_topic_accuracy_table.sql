CREATE TABLE user_topic_accuracy (
    id                      BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id                 BIGINT NOT NULL,
    subject                 VARCHAR(100) NOT NULL,
    topic                   VARCHAR(200) NOT NULL,
    class_grade             INT NOT NULL,
    
    -- Accuracy stats
    total_questions         INT DEFAULT 0,
    correct_answers         INT DEFAULT 0,
    accuracy_percentage     DECIMAL(5,2) DEFAULT 0.00,
    
    -- Per-difficulty breakdown
    easy_total              INT DEFAULT 0,
    easy_correct            INT DEFAULT 0,
    easy_accuracy           DECIMAL(5,2) DEFAULT 0.00,
    medium_total            INT DEFAULT 0,
    medium_correct          INT DEFAULT 0,
    medium_accuracy         DECIMAL(5,2) DEFAULT 0.00,
    hard_total              INT DEFAULT 0,
    hard_correct            INT DEFAULT 0,
    hard_accuracy           DECIMAL(5,2) DEFAULT 0.00,
    
    -- Recent performance (last 10 attempts)
    recent_accuracy         DECIMAL(5,2) DEFAULT 0.00,
    recent_attempts         JSON,
    
    -- Adaptive difficulty
    current_difficulty      ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    recommended_difficulty  ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    xp_multiplier           DECIMAL(3,2) DEFAULT 1.00,
    hint_frequency          ENUM('NONE', 'LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    
    -- Streak within topic
    current_streak          INT DEFAULT 0,
    best_streak             INT DEFAULT 0,
    
    -- Time performance
    avg_time_per_question   DECIMAL(7,2) DEFAULT 0.00,
    
    -- Mastery
    mastery_level           ENUM('NOVICE', 'BEGINNER', 'INTERMEDIATE', 
                                 'ADVANCED', 'EXPERT', 'MASTER') DEFAULT 'NOVICE',
    mastery_score           DECIMAL(5,2) DEFAULT 0.00,
    
    last_attempted_at       TIMESTAMP NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                            ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_topic (user_id, subject, topic, class_grade),
    INDEX idx_uta_user (user_id),
    INDEX idx_uta_subject (subject),
    INDEX idx_uta_topic (topic),
    INDEX idx_uta_class (class_grade),
    INDEX idx_uta_difficulty (current_difficulty),
    INDEX idx_uta_mastery (mastery_level),
    INDEX idx_uta_accuracy (accuracy_percentage DESC)
);
