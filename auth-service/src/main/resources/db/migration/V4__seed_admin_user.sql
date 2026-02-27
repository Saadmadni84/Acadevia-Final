-- Email: admin@acadevia.com
-- Password: Admin@123 (BCrypt hashed)
-- Role: ADMIN

INSERT INTO users (
    email, 
    password_hash, 
    role, 
    first_name, 
    last_name, 
    phone, 
    is_active, 
    is_email_verified
) VALUES (
    'admin@acadevia.com',
    '$2a$12$R.bTqZ3T.7/uE3/E3.E3.uE3.E3.E3.E3.E3.E3.E3.E3.E3.E3', -- Replace with actual hash for Admin@123
    'ADMIN',
    'System',
    'Admin',
    '0000000000',
    TRUE,
    TRUE
);
