-- Migration to add phone column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN phone VARCHAR(20) AFTER user_id;
