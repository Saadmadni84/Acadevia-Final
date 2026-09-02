-- Flyway Migration V10: Seed 6 Subject Quizzes for Class 10
-- Mathematics, Science, English, Hindi, Social Science, Computer Science

INSERT INTO quizzes (
    id, title, description, quiz_type, quiz_status, difficulty_level,
    subject, class_grade, board, language, total_questions,
    time_limit_minutes, pass_percentage, max_attempts,
    xp_reward, marks_per_question, total_marks, created_by
) VALUES
(101, 'Class 10 Real Numbers & Polynomials Practice', 'Comprehensive assessment on HCF, LCM, zeroes of polynomials, and quadratic relations.', 'PRACTICE', 'ACTIVE', 'MEDIUM', 'Mathematics', 10, 'CBSE', 'en', 5, 15, 60, 5, 50, 1, 5, 10),
(102, 'Class 10 Chemical Reactions & Life Processes', 'Test covering chemical equations, balancing, oxidation-reduction, and cellular respiration.', 'CHAPTER_TEST', 'ACTIVE', 'MEDIUM', 'Science', 10, 'CBSE', 'en', 5, 15, 60, 5, 50, 1, 5, 11),
(103, 'Class 10 First Flight & Grammar Essentials', 'Literature comprehension and English grammar fundamentals for Class 10 board prep.', 'PRACTICE', 'ACTIVE', 'EASY', 'English', 10, 'CBSE', 'en', 5, 15, 60, 5, 50, 1, 5, 12),
(104, 'Class 10 स्पर्श एवं व्याकरण: साखी एवं पद', 'कबीर की साखी, मीरा के पद और तत्पुरुष समास पर आधारित अभ्यास प्रश्न।', 'PRACTICE', 'ACTIVE', 'EASY', 'Hindi', 10, 'CBSE', 'hi', 5, 15, 60, 5, 50, 1, 5, 13),
(105, 'Class 10 The Rise of Nationalism & Federalism', 'Key historical events of European nationalism, Indian federalism, and democratic institutions.', 'CHAPTER_TEST', 'ACTIVE', 'MEDIUM', 'Social Science', 10, 'CBSE', 'en', 5, 15, 60, 5, 50, 1, 5, 14),
(106, 'Class 10 Python Fundamentals & Cyber Ethics', 'Python variables, loop control structures, conditional branching, and digital footprint ethics.', 'PRACTICE', 'ACTIVE', 'MEDIUM', 'Computer Science', 10, 'CBSE', 'en', 5, 15, 60, 5, 50, 1, 5, 15)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    subject = VALUES(subject),
    class_grade = VALUES(class_grade),
    total_questions = VALUES(total_questions),
    created_by = VALUES(created_by);
