-- ============================================================
-- Acadevia Platform - Service User Creation Script
-- Creates a dedicated MySQL user per microservice
-- Passwords should be overridden via environment variables
-- in docker-compose.yml for production deployments.
-- ============================================================

-- Auth Service
CREATE USER IF NOT EXISTS 'acadevia_auth_user'@'%'
    IDENTIFIED BY '${MYSQL_AUTH_PASSWORD:-auth_secret_changeme}';

-- User Service
CREATE USER IF NOT EXISTS 'acadevia_user_user'@'%'
    IDENTIFIED BY '${MYSQL_USER_PASSWORD:-user_secret_changeme}';

-- Course Service
CREATE USER IF NOT EXISTS 'acadevia_course_user'@'%'
    IDENTIFIED BY '${MYSQL_COURSE_PASSWORD:-course_secret_changeme}';

-- Content Service
CREATE USER IF NOT EXISTS 'acadevia_content_user'@'%'
    IDENTIFIED BY '${MYSQL_CONTENT_PASSWORD:-content_secret_changeme}';

-- Quiz Service
CREATE USER IF NOT EXISTS 'acadevia_quiz_user'@'%'
    IDENTIFIED BY '${MYSQL_QUIZ_PASSWORD:-quiz_secret_changeme}';

-- Game Service
CREATE USER IF NOT EXISTS 'acadevia_game_user'@'%'
    IDENTIFIED BY '${MYSQL_GAME_PASSWORD:-game_secret_changeme}';

-- Gamification Service
CREATE USER IF NOT EXISTS 'acadevia_gamification_user'@'%'
    IDENTIFIED BY '${MYSQL_GAMIFICATION_PASSWORD:-gamification_secret_changeme}';

-- Leaderboard Service
CREATE USER IF NOT EXISTS 'acadevia_leaderboard_user'@'%'
    IDENTIFIED BY '${MYSQL_LEADERBOARD_PASSWORD:-leaderboard_secret_changeme}';

-- Notification Service
CREATE USER IF NOT EXISTS 'acadevia_notification_user'@'%'
    IDENTIFIED BY '${MYSQL_NOTIFICATION_PASSWORD:-notification_secret_changeme}';

-- Admin Service
CREATE USER IF NOT EXISTS 'acadevia_admin_user'@'%'
    IDENTIFIED BY '${MYSQL_ADMIN_PASSWORD:-admin_secret_changeme}';

-- Locale Service
CREATE USER IF NOT EXISTS 'acadevia_locale_user'@'%'
    IDENTIFIED BY '${MYSQL_LOCALE_PASSWORD:-locale_secret_changeme}';

-- Sync Service
CREATE USER IF NOT EXISTS 'acadevia_sync_user'@'%'
    IDENTIFIED BY '${MYSQL_SYNC_PASSWORD:-sync_secret_changeme}';

-- Analytics Service
CREATE USER IF NOT EXISTS 'acadevia_analytics_user'@'%'
    IDENTIFIED BY '${MYSQL_ANALYTICS_PASSWORD:-analytics_secret_changeme}';
