-- Flyway Migration V5: Seed Class 10 Demo Accounts (10 Students + 6 Teachers)
-- Passwords hashed using standard BCrypt ($2a$12$)

-- Teachers for Class 10
INSERT INTO users (
    id, email, password_hash, role, first_name, last_name, student_school_id, phone, class_grade, school_id, preferred_language, is_active, is_email_verified
) VALUES
(10, 'rahul.math@demo.acadevia.com', '$2a$12$GPCqHIvXYIsguu/KiCh8Gu8LMCvcWPSXgtjYA8vi6AymBjoMHaCk.', 'TEACHER', 'Rahul', 'Verma', 'rahul.math', '9876543210', 10, 1, 'en', TRUE, TRUE),
(11, 'neha.science@demo.acadevia.com', '$2a$12$.8zXcUg8e/TloTnNyB/tmu.BJ10wDh5GDFCcyGrDoq.beUWMZ1IXG', 'TEACHER', 'Neha', 'Gupta', 'neha.science', '9876543211', 10, 1, 'en', TRUE, TRUE),
(12, 'amit.english@demo.acadevia.com', '$2a$12$beNlSgDo4G8lATeQSEoFmu/8gPqbuWxsjX4kQKjrvYGg8LNBj29oy', 'TEACHER', 'Amit', 'Sharma', 'amit.english', '9876543212', 10, 1, 'en', TRUE, TRUE),
(13, 'sunita.hindi@demo.acadevia.com', '$2a$12$/z8XZK12DbPE/p/kiIctZ.CI1Gk7PDcCm1iaS3lh1X.iWeftgoH3a', 'TEACHER', 'Sunita', 'Mishra', 'sunita.hindi', '9876543213', 10, 1, 'hi', TRUE, TRUE),
(14, 'vikram.social@demo.acadevia.com', '$2a$12$JVm8tcwOqOOm1aZD.faPuunp4KMPOKjrwAGa31o8ZSSDLpqTmvHom', 'TEACHER', 'Vikram', 'Singh', 'vikram.social', '9876543214', 10, 1, 'en', TRUE, TRUE),
(15, 'pooja.cs@demo.acadevia.com', '$2a$12$EP1EeSZ0jjqperKehZl9UuqT84MlCJPrDenewuR3PQEar4WPbiCqq', 'TEACHER', 'Pooja', 'Patel', 'pooja.cs', '9876543215', 10, 1, 'en', TRUE, TRUE)
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    student_school_id = VALUES(student_school_id),
    class_grade = VALUES(class_grade),
    school_id = VALUES(school_id),
    is_active = VALUES(is_active),
    is_email_verified = VALUES(is_email_verified);

-- 10 Students for Class 10
INSERT INTO users (
    id, email, password_hash, role, first_name, last_name, student_school_id, phone, class_grade, school_id, preferred_language, is_active, is_email_verified
) VALUES
(20, 'aarav.sharma10@demo.acadevia.com', '$2a$12$lVRmj7vpl.4TrqUgp5JaJeMqMNVZ4pS1y.4od7H/GQWf.OH8bukYa', 'STUDENT', 'Aarav', 'Sharma', 'aarav.sharma10', '9811100001', 10, 1, 'en', TRUE, TRUE),
(21, 'ananya.verma10@demo.acadevia.com', '$2a$12$CWE74JOSDpyM1FmH2nynO.72Yi2.YyAAP9usPo0RxTBuqx7j0mSGe', 'STUDENT', 'Ananya', 'Verma', 'ananya.verma10', '9811100002', 10, 1, 'en', TRUE, TRUE),
(22, 'rohan.mehta10@demo.acadevia.com', '$2a$12$5X3Z6hP4uhNu2bE2J50Ine7Ewf3D579JtQeBKl9KgUGuvHWDTwbBy', 'STUDENT', 'Rohan', 'Mehta', 'rohan.mehta10', '9811100003', 10, 1, 'en', TRUE, TRUE),
(23, 'priya.singh10@demo.acadevia.com', '$2a$12$ZCCBH96zshClBzd0Vczv6.HrvTzKrOAj5sywOq1FITacpLns3tMk6', 'STUDENT', 'Priya', 'Singh', 'priya.singh10', '9811100004', 10, 1, 'en', TRUE, TRUE),
(24, 'arjun.patel10@demo.acadevia.com', '$2a$12$zdX7kXypyfU40DIUhZK7jeCnaNwSy36mpwin0E4WX.PxqYvzR9CIi', 'STUDENT', 'Arjun', 'Patel', 'arjun.patel10', '9811100005', 10, 1, 'en', TRUE, TRUE),
(25, 'kavya.gupta10@demo.acadevia.com', '$2a$12$6F7yKvf4sx6fY6B/Kt2ZjO7dj6pOYiK1KAF4ez13APRpyzo0B0sYW', 'STUDENT', 'Kavya', 'Gupta', 'kavya.gupta10', '9811100006', 10, 1, 'en', TRUE, TRUE),
(26, 'aditya.kumar10@demo.acadevia.com', '$2a$12$QUdwMJbp8RQElHd1.9BV9uYL4mBLbQhvF8qbHgutAV5A3wRMxgIAW', 'STUDENT', 'Aditya', 'Kumar', 'aditya.kumar10', '9811100007', 10, 1, 'en', TRUE, TRUE),
(27, 'ishita.rao10@demo.acadevia.com', '$2a$12$QrmJk6Gb6iL4gBCtvJhknu7QpWhEUPWWI2f3M4DukSvIQsqZuYREu', 'STUDENT', 'Ishita', 'Rao', 'ishita.rao10', '9811100008', 10, 1, 'en', TRUE, TRUE),
(28, 'vihaan.joshi10@demo.acadevia.com', '$2a$12$XP.3cS.4yIT1YTXrm3ycoOLgTmrKl6CwSD5MMKjkqQ6y2aIwT0cWS', 'STUDENT', 'Vihaan', 'Joshi', 'vihaan.joshi10', '9811100009', 10, 1, 'en', TRUE, TRUE),
(29, 'meera.nair10@demo.acadevia.com', '$2a$12$J96qIVEyHf7rq4RIT1qgDeo5Qr/cDrwqz.4a/mWFcDJJ.y.C45JOG', 'STUDENT', 'Meera', 'Nair', 'meera.nair10', '9811100010', 10, 1, 'en', TRUE, TRUE)
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    student_school_id = VALUES(student_school_id),
    class_grade = VALUES(class_grade),
    school_id = VALUES(school_id),
    is_active = VALUES(is_active),
    is_email_verified = VALUES(is_email_verified);
