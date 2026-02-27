INSERT INTO quizzes (title, description, quiz_type, quiz_status, difficulty_level,
                     subject, class_grade, board, language, total_questions,
                     time_limit_minutes, pass_percentage, max_attempts,
                     xp_reward, marks_per_question, total_marks, created_by) VALUES

('Real Numbers - Practice Quiz', 
 'Practice quiz on Real Numbers chapter for Class 10 CBSE Mathematics',
 'PRACTICE', 'ACTIVE', 'MIXED',
 'Mathematics', 10, 'CBSE', 'en', 10,
 15, 60, 5,
 50, 1, 10, 1),

('Newton Laws of Motion - Chapter Test',
 'Test your understanding of Newton''s three laws of motion',
 'CHAPTER_TEST', 'ACTIVE', 'MEDIUM',
 'Physics', 9, 'CBSE', 'en', 15,
 20, 60, 3,
 75, 2, 30, 1),

('हिंदी व्याकरण - संज्ञा प्रैक्टिस',
 'संज्ञा के भेद और उदाहरण पर आधारित प्रश्न',
 'PRACTICE', 'ACTIVE', 'EASY',
 'Hindi', 8, 'CBSE', 'hi', 10,
 10, 50, 5,
 40, 1, 10, 2);

-- Sample Questions for Quiz 1 (Real Numbers)
INSERT INTO questions (quiz_id, question_text, question_type, option_a, option_b,
                       option_c, option_d, correct_answer, explanation, subject,
                       class_grade, board, topic, concept, difficulty_level,
                       language, marks, xp_value, time_expected_sec,
                       is_bank_question, sequence_order, created_by) VALUES

(1, 'The HCF of 12 and 18 is:', 'MCQ',
 '2', '4', '6', '12', '6',
 'HCF(12,18): 12 = 2²×3, 18 = 2×3². Common factors: 2¹×3¹ = 6',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'HCF and LCM', 'EASY',
 'en', 1, 5, 30, true, 1, 1),

(1, 'Which of the following is an irrational number?', 'MCQ',
 '0.333...', '√4', '√7', '22/7', '√7',
 '√7 cannot be expressed as p/q. 0.333... = 1/3 (rational), √4 = 2 (rational), 22/7 is rational.',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Irrational Numbers', 'EASY',
 'en', 1, 5, 30, true, 2, 1),

(1, 'The decimal expansion of a rational number is always:', 'MCQ',
 'terminating', 'non-terminating repeating', 'either terminating or non-terminating repeating', 'non-terminating non-repeating',
 'either terminating or non-terminating repeating',
 'Rational numbers have decimal expansions that are either terminating (like 0.5) or non-terminating repeating (like 0.333...).',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Decimal Expansion', 'MEDIUM',
 'en', 1, 5, 45, true, 3, 1),

(1, 'If HCF(a,b) = 1, then a and b are called:', 'MCQ',
 'composite numbers', 'co-prime numbers', 'prime numbers', 'twin primes',
 'co-prime numbers',
 'Two numbers whose HCF is 1 are called co-prime numbers. They need not be prime individually.',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Co-prime Numbers', 'MEDIUM',
 'en', 1, 5, 30, true, 4, 1),

(1, 'The Fundamental Theorem of Arithmetic states that every composite number can be expressed as a product of primes in a _____ way.', 'FILL_BLANK',
 'unique', 'multiple', 'simple', 'complex',
 'unique',
 'The Fundamental Theorem of Arithmetic states that every composite number can be factorized as a product of primes, and this factorization is unique (apart from the order of factors).',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Fundamental Theorem', 'MEDIUM',
 'en', 1, 5, 45, true, 5, 1),

(1, 'True or False: √2 × √3 = √6', 'TRUE_FALSE',
 'True', 'False', NULL, NULL, 'True',
 'By the property of square roots: √a × √b = √(a×b). Therefore √2 × √3 = √(2×3) = √6.',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Properties of Irrational Numbers', 'EASY',
 'en', 1, 5, 20, true, 6, 1),

(1, 'LCM(12, 15, 20) = ?', 'MCQ',
 '30', '60', '120', '180', '60',
 '12 = 2²×3, 15 = 3×5, 20 = 2²×5. LCM = 2²×3×5 = 60',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'HCF and LCM', 'MEDIUM',
 'en', 1, 5, 60, true, 7, 1),

(1, 'If p is a prime number and p divides a², then p divides a. This is known as:', 'MCQ',
 'Euclid Division Lemma', 'Fundamental Theorem', 'Theorem 1.3', 'None of these',
 'Theorem 1.3',
 'This is Theorem 1.3 in NCERT, which is a consequence of the Fundamental Theorem of Arithmetic.',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Theorems', 'HARD',
 'en', 1, 5, 45, true, 8, 1),

(1, 'The number 0 is:', 'MULTI_SELECT',
 'a whole number', 'a natural number', 'a rational number', 'an integer',
 'a whole number',
 '["a whole number", "a rational number", "an integer"]',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Number Classification', 'MEDIUM',
 'en', 1, 5, 30, true, 9, 1),

(1, 'Prove that √5 is irrational. What method is used?', 'MCQ',
 'Direct proof', 'Proof by contradiction', 'Mathematical induction', 'Proof by construction',
 'Proof by contradiction',
 'We assume √5 is rational (p/q form), derive a contradiction showing both p and q are divisible by 5, contradicting that they are co-prime.',
 'Mathematics', 10, 'CBSE', 'Real Numbers', 'Irrationality Proofs', 'HARD',
 'en', 1, 5, 45, true, 10, 1);
