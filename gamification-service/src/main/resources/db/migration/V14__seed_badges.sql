INSERT INTO badges (name, display_name, description, badge_type, rarity,
                    criteria_type, criteria_value, xp_bonus, credit_bonus,
                    icon_url, category, display_order) VALUES
-- First Actions
('welcome',          'Welcome!',          'Created your Acadevia account',            'FIRST_ACTION', 'COMMON',    'ACCOUNT_CREATED',   1,    10,  1,  '/badges/welcome.svg',       'Getting Started', 1),
('first_quiz',       'Quiz Starter',      'Completed your first quiz',                'FIRST_ACTION', 'COMMON',    'QUIZ_COUNT',        1,    20,  2,  '/badges/first-quiz.svg',    'Getting Started', 2),
('first_game',       'Game On!',          'Played your first learning game',          'FIRST_ACTION', 'COMMON',    'GAME_COUNT',        1,    20,  2,  '/badges/first-game.svg',    'Getting Started', 3),
('first_course',     'First Steps',       'Enrolled in your first course',            'FIRST_ACTION', 'COMMON',    'ENROLLMENT_COUNT',  1,    15,  1,  '/badges/first-course.svg',  'Getting Started', 4),
('first_video',      'Video Watcher',     'Watched your first video lesson',          'FIRST_ACTION', 'COMMON',    'VIDEO_COUNT',       1,    15,  1,  '/badges/first-video.svg',   'Getting Started', 5),

-- Streak Badges
('streak_3',         '3-Day Streak',      'Maintained a 3-day learning streak',       'STREAK',       'COMMON',    'STREAK_DAYS',       3,    25,  3,  '/badges/streak-3.svg',      'Consistency', 10),
('streak_7',         'Week Warrior',      'Maintained a 7-day learning streak',       'STREAK',       'UNCOMMON',  'STREAK_DAYS',       7,    50,  5,  '/badges/streak-7.svg',      'Consistency', 11),
('streak_14',        'Fortnight Focus',   '14-day learning streak',                   'STREAK',       'UNCOMMON',  'STREAK_DAYS',       14,   100, 10, '/badges/streak-14.svg',     'Consistency', 12),
('streak_30',        'Monthly Master',    '30-day learning streak',                   'STREAK',       'RARE',      'STREAK_DAYS',       30,   200, 20, '/badges/streak-30.svg',     'Consistency', 13),
('streak_60',        'Dedicated Learner', '60-day learning streak',                   'STREAK',       'EPIC',      'STREAK_DAYS',       60,   400, 30, '/badges/streak-60.svg',     'Consistency', 14),
('streak_100',       'Centurion',         '100-day learning streak!',                 'STREAK',       'LEGENDARY', 'STREAK_DAYS',       100,  750, 50, '/badges/streak-100.svg',    'Consistency', 15),
('streak_365',       'Year of Learning',  '365-day learning streak! Incredible!',     'STREAK',       'MYTHIC',    'STREAK_DAYS',       365,  2000,100,'/badges/streak-365.svg',    'Consistency', 16),

-- XP Milestones
('xp_100',           'First Hundred',     'Earned 100 XP',                            'XP_MILESTONE', 'COMMON',    'TOTAL_XP',          100,   10,  1,  '/badges/xp-100.svg',        'XP Milestones', 20),
('xp_500',           'Rising Star',       'Earned 500 XP',                            'XP_MILESTONE', 'COMMON',    'TOTAL_XP',          500,   25,  3,  '/badges/xp-500.svg',        'XP Milestones', 21),
('xp_1000',          'XP Hunter',         'Earned 1,000 XP',                          'XP_MILESTONE', 'UNCOMMON',  'TOTAL_XP',          1000,  50,  5,  '/badges/xp-1000.svg',       'XP Milestones', 22),
('xp_5000',          'XP Master',         'Earned 5,000 XP',                          'XP_MILESTONE', 'RARE',      'TOTAL_XP',          5000,  150, 15, '/badges/xp-5000.svg',       'XP Milestones', 23),
('xp_10000',         'XP Legend',         'Earned 10,000 XP',                         'XP_MILESTONE', 'EPIC',      'TOTAL_XP',          10000, 300, 25, '/badges/xp-10000.svg',      'XP Milestones', 24),
('xp_25000',         'XP Titan',          'Earned 25,000 XP',                         'XP_MILESTONE', 'LEGENDARY', 'TOTAL_XP',          25000, 500, 50, '/badges/xp-25000.svg',      'XP Milestones', 25),
('xp_100000',        'XP Immortal',       'Earned 100,000 XP! You are a legend!',     'XP_MILESTONE', 'MYTHIC',    'TOTAL_XP',          100000,1000,100,'/badges/xp-100000.svg',     'XP Milestones', 26),

-- Quiz Mastery
('quiz_10',          'Quiz Explorer',     'Completed 10 quizzes',                     'QUIZ_MASTER',  'COMMON',    'QUIZ_COUNT',        10,    30,  3,  '/badges/quiz-10.svg',       'Quiz Mastery', 30),
('quiz_50',          'Quiz Warrior',      'Completed 50 quizzes',                     'QUIZ_MASTER',  'UNCOMMON',  'QUIZ_COUNT',        50,    100, 10, '/badges/quiz-50.svg',       'Quiz Mastery', 31),
('quiz_100',         'Quiz Champion',     'Completed 100 quizzes',                    'QUIZ_MASTER',  'RARE',      'QUIZ_COUNT',        100,   200, 20, '/badges/quiz-100.svg',      'Quiz Mastery', 32),
('quiz_500',         'Quiz Legend',       'Completed 500 quizzes!',                   'QUIZ_MASTER',  'EPIC',      'QUIZ_COUNT',        500,   500, 50, '/badges/quiz-500.svg',      'Quiz Mastery', 33),
('perfect_1',        'Perfectionist',     'Scored 100% on a quiz',                    'QUIZ_MASTER',  'UNCOMMON',  'PERFECT_SCORE',     1,     50,  5,  '/badges/perfect-1.svg',     'Quiz Mastery', 34),
('perfect_10',       'Flawless',          'Scored 100% on 10 quizzes',                'QUIZ_MASTER',  'RARE',      'PERFECT_SCORE',     10,    150, 15, '/badges/perfect-10.svg',    'Quiz Mastery', 35),
('perfect_50',       'Untouchable',       'Scored 100% on 50 quizzes!',               'QUIZ_MASTER',  'LEGENDARY', 'PERFECT_SCORE',     50,    500, 50, '/badges/perfect-50.svg',    'Quiz Mastery', 36),

-- Course Mastery
('course_1',         'Course Completer',  'Completed your first course',              'COURSE_MASTERY','COMMON',   'COURSE_COUNT',      1,     50,  5,  '/badges/course-1.svg',      'Course Mastery', 40),
('course_5',         'Knowledge Seeker',  'Completed 5 courses',                      'COURSE_MASTERY','UNCOMMON', 'COURSE_COUNT',      5,     150, 10, '/badges/course-5.svg',      'Course Mastery', 41),
('course_10',        'Scholar',           'Completed 10 courses',                     'COURSE_MASTERY','RARE',     'COURSE_COUNT',      10,    300, 25, '/badges/course-10.svg',     'Course Mastery', 42),
('course_25',        'Academic',          'Completed 25 courses',                     'COURSE_MASTERY','EPIC',     'COURSE_COUNT',      25,    500, 50, '/badges/course-25.svg',     'Course Mastery', 43),

-- Game Mastery
('game_10',          'Gamer',             'Played 10 learning games',                 'GAME_MASTER',  'COMMON',    'GAME_COUNT',        10,    30,  3,  '/badges/game-10.svg',       'Game Mastery', 50),
('game_50',          'Game Warrior',      'Played 50 learning games',                 'GAME_MASTER',  'UNCOMMON',  'GAME_COUNT',        50,    100, 10, '/badges/game-50.svg',       'Game Mastery', 51),
('game_100',         'Game Master',       'Played 100 learning games',                'GAME_MASTER',  'RARE',      'GAME_COUNT',        100,   200, 20, '/badges/game-100.svg',      'Game Mastery', 52),
('game_win_streak_5','Win Streak',        'Won 5 games in a row',                     'GAME_MASTER',  'RARE',      'GAME_WIN_STREAK',   5,     150, 15, '/badges/win-streak-5.svg',  'Game Mastery', 53),

-- Speed Badges
('speed_demon',      'Speed Demon',       'Completed a quiz in less than half time',  'SPEED',        'UNCOMMON',  'SPEED_BONUS',       1,     30,  3,  '/badges/speed-demon.svg',   'Speed', 60),
('lightning',        'Lightning Fast',    'Earned 10 speed bonuses',                  'SPEED',        'RARE',      'SPEED_BONUS',       10,    100, 10, '/badges/lightning.svg',     'Speed', 61),

-- Leaderboard
('top_10_school',    'School Top 10',     'Reached top 10 in school leaderboard',     'LEADERBOARD',  'UNCOMMON',  'SCHOOL_RANK',       10,    100, 10, '/badges/top10-school.svg',  'Leaderboard', 70),
('top_1_school',     'School Champion',   'Reached #1 in school leaderboard',         'LEADERBOARD',  'RARE',      'SCHOOL_RANK',       1,     300, 25, '/badges/top1-school.svg',   'Leaderboard', 71),
('top_10_city',      'City Top 10',       'Reached top 10 in city leaderboard',       'LEADERBOARD',  'RARE',      'CITY_RANK',         10,    200, 20, '/badges/top10-city.svg',    'Leaderboard', 72),
('top_10_state',     'State Top 10',      'Reached top 10 in state leaderboard',      'LEADERBOARD',  'EPIC',      'STATE_RANK',        10,    400, 40, '/badges/top10-state.svg',   'Leaderboard', 73),
('top_10_national',  'National Top 10',   'Reached top 10 in national leaderboard!',  'LEADERBOARD',  'LEGENDARY', 'NATIONAL_RANK',     10,    1000,100,'/badges/top10-national.svg','Leaderboard', 74),

-- Daily Challenge
('daily_7',          'Weekly Challenger', 'Completed daily challenge 7 days in a row', 'CONSISTENCY', 'UNCOMMON',  'DAILY_CHALLENGE_STREAK', 7, 75, 7, '/badges/daily-7.svg',      'Daily Challenge', 80),
('daily_30',         'Monthly Challenger','Completed daily challenge 30 days in a row','CONSISTENCY', 'RARE',      'DAILY_CHALLENGE_STREAK', 30,200,20,'/badges/daily-30.svg',      'Daily Challenge', 81);
