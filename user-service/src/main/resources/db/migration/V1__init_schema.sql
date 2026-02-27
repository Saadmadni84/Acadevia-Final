CREATE TABLE states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(200),
    code VARCHAR(10) NOT NULL UNIQUE,
    default_language VARCHAR(20) NOT NULL DEFAULT 'hi',
    region VARCHAR(20) NOT NULL,
    is_union_territory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(200),
    state_id BIGINT NOT NULL,
    district VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'TIER_3',
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE schools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_local VARCHAR(500),
    code VARCHAR(50) NOT NULL UNIQUE,
    state_id BIGINT NOT NULL,
    city_id BIGINT NOT NULL,
    district VARCHAR(100),
    board VARCHAR(50) NOT NULL,
    medium VARCHAR(50) NOT NULL,
    medium_language VARCHAR(50),
    school_type VARCHAR(20) DEFAULT 'PRIVATE',
    address TEXT,
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    principal_name VARCHAR(200),
    established_year INT,
    udise_code VARCHAR(20),
    affiliation_no VARCHAR(50),
    total_students INT DEFAULT 0,
    total_teachers INT DEFAULT 0,
    total_classrooms INT DEFAULT 0,
    logo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    registered_by BIGINT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    class_grade INT NOT NULL,
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    academic_year VARCHAR(10) NOT NULL,
    class_teacher_id BIGINT,
    max_students INT DEFAULT 60,
    current_students INT DEFAULT 0,
    room_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    UNIQUE KEY uk_classroom (school_id, class_grade, section, academic_year)
);

CREATE TABLE teacher_school_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    subjects JSON,
    designation VARCHAR(100),
    employee_id VARCHAR(50),
    is_primary_school BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    UNIQUE KEY uk_teacher_school (teacher_id, school_id)
);

CREATE TABLE teacher_classroom_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    is_class_teacher BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    UNIQUE KEY uk_teacher_classroom_subject (teacher_id, classroom_id, subject)
);

CREATE TABLE student_classroom_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    classroom_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    roll_number VARCHAR(20),
    student_school_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    UNIQUE KEY uk_student_classroom_year (student_id, classroom_id, academic_year),
    UNIQUE KEY uk_student_school_year (student_school_id, school_id, academic_year)
);

CREATE TABLE user_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    pincode VARCHAR(10),
    parent_name VARCHAR(200),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    emergency_contact VARCHAR(20),
    blood_group VARCHAR(5),
    interests JSON,
    achievements JSON,
    social_links JSON,
    notification_preferences JSON,
    privacy_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
