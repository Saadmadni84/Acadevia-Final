-- ============================================================
-- Acadevia Platform - Permission Grants
-- Each service user gets ALL privileges on its own database
-- ============================================================

GRANT ALL PRIVILEGES ON `acadevia_auth`.* TO 'acadevia_auth_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_user`.* TO 'acadevia_user_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_course`.* TO 'acadevia_course_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_content`.* TO 'acadevia_content_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_quiz`.* TO 'acadevia_quiz_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_game`.* TO 'acadevia_game_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_gamification`.* TO 'acadevia_gamification_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_leaderboard`.* TO 'acadevia_leaderboard_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_notification`.* TO 'acadevia_notification_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_admin`.* TO 'acadevia_admin_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_locale`.* TO 'acadevia_locale_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_sync`.* TO 'acadevia_sync_user'@'%';
GRANT ALL PRIVILEGES ON `acadevia_analytics`.* TO 'acadevia_analytics_user'@'%';

FLUSH PRIVILEGES;
