INSERT INTO achievements (achievement_name, display_name, description, category, target_value, metric_type, reward_xp, reward_credits) VALUES
('xp_1000',            'Novice Earner',       'Earn 1,000 XP total',           'XP',       1000, 'TOTAL_XP',       50,  5),
('xp_5000',            'Skilled Earner',      'Earn 5,000 XP total',           'XP',       5000, 'TOTAL_XP',       100, 10),
('courses_5',          'Course Enthusiast',   'Complete 5 courses',            'Learning', 5,    'COURSES_COMPLETED', 100, 10),
('courses_20',         'Degrees Master',      'Complete 20 courses',           'Learning', 20,   'COURSES_COMPLETED', 500, 50),
('streak_7',           'Week Warrior',        'Maintain a 7-day streak',       'Streak',   7,    'CURRENT_STREAK',    50,  5),
('streak_30',          'Monthly Master',      'Maintain a 30-day streak',      'Streak',   30,   'CURRENT_STREAK',    200, 20),
('badges_10',          'Badge Collector',     'Collect 10 badges',             'Collection', 10, 'BADGES_EARNED',     150, 15),
('quiz_perfect_10',    'Perfectionist',       'Get 10 perfect quiz scores',    'Quiz',     10,   'PERFECT_SCORES',    200, 20);
