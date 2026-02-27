CREATE TABLE quizzes (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    instructions        TEXT,
    
    -- Linking
    course_id           BIGINT,
    module_id           BIGINT,
    lesson_id           BIGINT,
    chapter_id          BIGINT,
    concept_id          BIGINT,
    
    -- Classification
    quiz_type           ENUM('PRACTICE', 'GRADED', 'CHALLENGE', 
                             'MULTIPLAYER', 'DAILY', 'MOCK_TEST',
                             'CHAPTER_TEST', 'UNIT_TEST') DEFAULT 'PRACTICE',
    quiz_status         ENUM('DRAFT', 'ACTIVE', 'ARCHIVED', 'SCHEDULED') DEFAULT 'DRAFT',
    difficulty_level    ENUM('EASY', 'MEDIUM', 'HARD', 'ADAPTIVE', 'MIXED') DEFAULT 'MEDIUM',
    
    -- Subject info
    subject             VARCHAR(100) NOT NULL,
    class_grade         INT NOT NULL,
    board               VARCHAR(50) DEFAULT 'ALL',
    language            VARCHAR(20) DEFAULT 'en',
    topic               VARCHAR(200),
    tags                JSON,
    
    -- Configuration
    total_questions     INT NOT NULL,
    time_limit_minutes  INT DEFAULT 30,
    pass_percentage     INT DEFAULT 60,
    max_attempts        INT DEFAULT 3,
    negative_marking    BOOLEAN DEFAULT FALSE,
    negative_mark_value DECIMAL(3,2) DEFAULT 0.25,
    shuffle_questions   BOOLEAN DEFAULT TRUE,
    shuffle_options     BOOLEAN DEFAULT TRUE,
    show_correct_answer BOOLEAN DEFAULT TRUE,
    show_explanation    BOOLEAN DEFAULT TRUE,
    show_result_immediately BOOLEAN DEFAULT TRUE,
    allow_review        BOOLEAN DEFAULT TRUE,
    allow_skip          BOOLEAN DEFAULT TRUE,
    one_question_at_time BOOLEAN DEFAULT FALSE,
    allow_back_navigation BOOLEAN DEFAULT TRUE,
    
    -- Rewards
    xp_reward           INT DEFAULT 50,
    xp_per_correct      INT DEFAULT 5,
    xp_bonus_perfect    INT DEFAULT 50,
    xp_bonus_speed      INT DEFAULT 20,
    credit_reward       INT DEFAULT 5,
    
    -- Marks
    marks_per_question  INT DEFAULT 1,
    total_marks         INT DEFAULT 0,
    
    -- Scheduling
    scheduled_start     TIMESTAMP NULL,
    scheduled_end       TIMESTAMP NULL,
    
    -- Stats
    total_attempts      INT DEFAULT 0,
    unique_attempters   INT DEFAULT 0,
    avg_score_pct       DECIMAL(5,2) DEFAULT 0.00,
    avg_time_seconds    INT DEFAULT 0,
    pass_rate           DECIMAL(5,2) DEFAULT 0.00,
    highest_score       INT DEFAULT 0,
    lowest_score        INT DEFAULT 0,
    
    -- Ownership
    created_by          BIGINT NOT NULL,
    school_id           BIGINT,
    
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
                        ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_quiz_course (course_id),
    INDEX idx_quiz_module (module_id),
    INDEX idx_quiz_lesson (lesson_id),
    INDEX idx_quiz_type (quiz_type),
    INDEX idx_quiz_status (quiz_status),
    INDEX idx_quiz_subject (subject),
    INDEX idx_quiz_class (class_grade),
    INDEX idx_quiz_board (board),
    INDEX idx_quiz_language (language),
    INDEX idx_quiz_difficulty (difficulty_level),
    INDEX idx_quiz_creator (created_by),
    INDEX idx_quiz_school (school_id),
    INDEX idx_quiz_topic (topic),
    INDEX idx_quiz_active (is_active),
    INDEX idx_quiz_scheduled (scheduled_start, scheduled_end),
    FULLTEXT idx_quiz_search (title, description, topic)
);
