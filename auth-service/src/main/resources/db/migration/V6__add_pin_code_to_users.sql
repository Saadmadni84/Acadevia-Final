-- Add pin_code column to users table
ALTER TABLE users ADD COLUMN pin_code VARCHAR(10) AFTER city_id;
