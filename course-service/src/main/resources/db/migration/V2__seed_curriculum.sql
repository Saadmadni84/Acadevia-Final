-- V2: Seed curriculum courses, modules, and lessons
-- Provides real academic courses and chapters for Class 10 & 9

-- Courses
INSERT INTO courses (
    id, title, slug, description, short_description, category, subject,
    class_grade, education_board, language, price, instructor_id, teacher_id,
    status, created_at, published_at, featured, is_active, is_featured
)
VALUES
(1, 'Class 10 Mathematics', 'class-10-mathematics', 'Complete CBSE Class 10 Mathematics curriculum including Real Numbers, Polynomials, and Quadratic Equations.', 'Master Class 10 Mathematics with comprehensive video lessons and practice problems.', 'ACADEMICS', 'Mathematics', 10, 'CBSE', 'en', 0.0, 10, 10, 'PUBLISHED', NOW(), NOW(), 1, 1, 1),
(2, 'Class 10 Science', 'class-10-science', 'Complete CBSE Class 10 Science curriculum covering Physics, Chemistry, and Biology.', 'Master Class 10 Science concepts and experiments.', 'ACADEMICS', 'Science', 10, 'CBSE', 'en', 0.0, 10, 10, 'PUBLISHED', NOW(), NOW(), 1, 1, 1),
(3, 'Class 9 Mathematics', 'class-9-mathematics', 'Complete CBSE Class 9 Mathematics curriculum including Number Systems, Polynomials, and Geometry.', 'Build strong mathematical foundations for Class 9.', 'ACADEMICS', 'Mathematics', 9, 'CBSE', 'en', 0.0, 10, 10, 'PUBLISHED', NOW(), NOW(), 0, 1, 0)
ON DUPLICATE KEY UPDATE title = VALUES(title), status = VALUES(status);

-- Modules for Course 1 (Class 10 Mathematics)
INSERT INTO modules (
    id, title, description, order_index, sequence_order, course_id, is_active, created_at, updated_at
)
VALUES
(1, 'Real Numbers', 'Fundamental Theorem of Arithmetic, irrational numbers, decimal expansions.', 1, 1, 1, 1, NOW(), NOW()),
(2, 'Polynomials', 'Zeroes of a polynomial, relationship between zeroes and coefficients, division algorithm.', 2, 2, 1, 1, NOW(), NOW()),
(3, 'Pair of Linear Equations in Two Variables', 'Graphical and algebraic methods of solving linear equations.', 3, 3, 1, 1, NOW(), NOW()),
(4, 'Quadratic Equations', 'Standard form, solutions by factorisation and quadratic formula, nature of roots.', 4, 4, 1, 1, NOW(), NOW()),
(5, 'Arithmetic Progressions', 'nth term and sum of first n terms of an AP.', 5, 5, 1, 1, NOW(), NOW()),
(6, 'Triangles', 'Similar figures, similarity criteria, areas of similar triangles, Pythagoras theorem.', 6, 6, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Modules for Course 2 (Class 10 Science)
INSERT INTO modules (
    id, title, description, order_index, sequence_order, course_id, is_active, created_at, updated_at
)
VALUES
(7, 'Chemical Reactions and Equations', 'Types of chemical reactions, balancing equations, oxidation and reduction.', 1, 1, 2, 1, NOW(), NOW()),
(8, 'Acids, Bases and Salts', 'Properties of acids and bases, pH scale, salts and their preparation.', 2, 2, 2, 1, NOW(), NOW()),
(9, 'Metals and Non-metals', 'Physical and chemical properties, reactivity series, extraction of metals.', 3, 3, 2, 1, NOW(), NOW()),
(10, 'Life Processes', 'Nutrition, respiration, transportation, and excretion in plants and animals.', 4, 4, 2, 1, NOW(), NOW()),
(11, 'Light – Reflection and Refraction', 'Spherical mirrors, refraction through lenses, lens formula, magnification.', 5, 5, 2, 1, NOW(), NOW()),
(12, 'Electricity', 'Electric current, potential difference, Ohm law, resistance and resistivity.', 6, 6, 2, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Lessons for Module 1 (Real Numbers)
INSERT INTO lessons (
    id, title, description, type, content_type, order_index, sequence_order, course_id, module_id, is_active, created_at, updated_at
)
VALUES
(1, 'Introduction to Real Numbers', 'Overview of real numbers, rational and irrational numbers.', 'VIDEO', 'VIDEO', 1, 1, 1, 1, 1, NOW(), NOW()),
(2, 'Fundamental Theorem of Arithmetic', 'Prime factorisation and unique factorisation of composite numbers.', 'VIDEO', 'VIDEO', 2, 2, 1, 1, 1, NOW(), NOW()),
(3, 'Revisiting Irrational Numbers', 'Proving root 2, root 3, and root 5 are irrational.', 'VIDEO', 'VIDEO', 3, 3, 1, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Lessons for Module 2 (Polynomials)
INSERT INTO lessons (
    id, title, description, type, content_type, order_index, sequence_order, course_id, module_id, is_active, created_at, updated_at
)
VALUES
(4, 'Geometrical Meaning of Zeroes of a Polynomial', 'Understanding roots graphically.', 'VIDEO', 'VIDEO', 1, 1, 1, 2, 1, NOW(), NOW()),
(5, 'Relationship Between Zeroes and Coefficients', 'Quadratic and cubic polynomials.', 'VIDEO', 'VIDEO', 2, 2, 1, 2, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);
