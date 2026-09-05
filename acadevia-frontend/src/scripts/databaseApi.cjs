const { execSync } = require('child_process');

function execSql(query) {
  try {
    let output;
    try {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot -B';
      output = execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    } catch {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot_password -B';
      output = execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    }
    const lines = output.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split('\t');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx];
      });
      rows.push(obj);
    }
    return rows;
  } catch (err) {
    console.error('execSql error:', err.message);
    return [];
  }
}

function execSqlMutation(query) {
  try {
    try {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot';
      execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
    } catch {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot_password';
      execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    }
    return true;
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    console.error('execSqlMutation error:', err.message, stderr);
    return false;
  }
}

// Ensure database tables exist across MySQL container restarts
function ensureSchema() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS acadevia_content_db.content_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      class_id INT DEFAULT 10,
      subject_id INT DEFAULT 100,
      chapter_id INT DEFAULT 1,
      class_number INT NOT NULL DEFAULT 10,
      subject_name VARCHAR(100) NOT NULL,
      chapter_name VARCHAR(150) NOT NULL,
      content_type VARCHAR(50) NOT NULL DEFAULT 'PDF',
      file_url VARCHAR(1000) NOT NULL,
      file_name VARCHAR(255),
      mime_type VARCHAR(100),
      thumbnail_url VARCHAR(1000),
      file_size BIGINT DEFAULT 0,
      duration_seconds INT DEFAULT 0,
      language VARCHAR(10) DEFAULT 'en',
      teacher_id BIGINT DEFAULT 10,
      teacher_name VARCHAR(150) DEFAULT 'Teacher',
      status VARCHAR(50) DEFAULT 'PUBLISHED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS acadevia_content_db.student_learning_progress (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      student_id BIGINT NOT NULL,
      content_id VARCHAR(100) NOT NULL,
      course_id VARCHAR(100),
      subject VARCHAR(100) NOT NULL,
      chapter VARCHAR(150) NOT NULL,
      class_grade INT NOT NULL DEFAULT 10,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content_type VARCHAR(50) DEFAULT 'VIDEO',
      file_url VARCHAR(1000),
      thumbnail_url VARCHAR(1000),
      last_position_seconds INT NOT NULL DEFAULT 0,
      duration_seconds INT NOT NULL DEFAULT 0,
      progress_percent DOUBLE NOT NULL DEFAULT 0.0,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_student_content (student_id, content_id),
      INDEX idx_slp_student_recent (student_id, last_watched_at DESC)
    );

    CREATE TABLE IF NOT EXISTS acadevia_quiz_db.quizzes (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      subject VARCHAR(100) NOT NULL,
      class_grade INT NOT NULL DEFAULT 10,
      chapter_info VARCHAR(150),
      time_limit_minutes INT DEFAULT 5,
      difficulty_level VARCHAR(50) DEFAULT 'MEDIUM',
      xp_reward INT DEFAULT 50,
      is_active TINYINT(1) DEFAULT 1,
      created_by BIGINT DEFAULT 10,
      assigned_to_student_id BIGINT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS acadevia_quiz_db.questions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      quiz_id BIGINT NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      marks INT DEFAULT 10,
      topic VARCHAR(255) DEFAULT 'General',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE acadevia_quiz_db.questions
      MODIFY COLUMN option_a TEXT NOT NULL,
      MODIFY COLUMN option_b TEXT NOT NULL,
      MODIFY COLUMN option_c TEXT NOT NULL,
      MODIFY COLUMN option_d TEXT NOT NULL,
      MODIFY COLUMN correct_answer TEXT NOT NULL,
      MODIFY COLUMN topic VARCHAR(255) DEFAULT 'General';

    CREATE TABLE IF NOT EXISTS acadevia_quiz_db.quiz_attempts (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      quiz_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      status VARCHAR(50) DEFAULT 'SUBMITTED',
      attempt_number INT DEFAULT 1,
      score INT NOT NULL DEFAULT 0,
      total_marks INT NOT NULL DEFAULT 50,
      percentage INT NOT NULL DEFAULT 0,
      is_passed TINYINT(1) DEFAULT 0,
      total_questions INT DEFAULT 5,
      correct_answers INT DEFAULT 0,
      wrong_answers INT DEFAULT 0,
      time_taken_seconds INT DEFAULT 180,
      xp_earned INT DEFAULT 50,
      answers_json TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    execSqlMutation(initSql);
  } catch (err) {
    // ignore if docker is offline
  }
}

try {
  ensureSchema();
} catch (e) {
  // offline fallback
}

// ---------------------------------------------------------------------------
// Server In-Memory Cache with Instant Mutation-Based Invalidation
// ---------------------------------------------------------------------------
let stateVersion = Date.now();
const CACHE_TTL_MS = 60000; // 60s fallback TTL

const serverCache = {
  teacherStudents: new Map(),
  teacherAnalytics: new Map(),
  leaderboard: new Map(),
  users: null,
  quizzes: null,
  quizAttempts: null,
  contentItems: null,
  fullState: null,
};

function getStateVersion() {
  return stateVersion;
}

function invalidateServerCache() {
  stateVersion = Date.now();
  serverCache.teacherStudents.clear();
  serverCache.teacherAnalytics.clear();
  serverCache.leaderboard.clear();
  serverCache.users = null;
  serverCache.quizzes = null;
  serverCache.quizAttempts = null;
  serverCache.contentItems = null;
  serverCache.fullState = null;
}

function isFresh(entry) {
  return entry && (Date.now() - entry.timestamp < CACHE_TTL_MS);
}


// ---------------------------------------------------------------------------
// Legacy Seeded Quiz ID Aliases Mapping (Preserved for Backward Compatibility)
// ---------------------------------------------------------------------------
const LEGACY_SEEDED_QUIZ_MAP = {
  '101': 'quiz-c10-math',
  '102': 'quiz-c10-sci',
  '103': 'quiz-c10-eng',
  '104': 'quiz-c10-hin',
  '105': 'quiz-c10-soc',
  '106': 'quiz-c10-cs',
  '107': 'quiz-10-math-1',
  '108': 'quiz-10-math-2',
};

const REVERSE_LEGACY_QUIZ_MAP = {};
Object.entries(LEGACY_SEEDED_QUIZ_MAP).forEach(([num, alias]) => {
  REVERSE_LEGACY_QUIZ_MAP[alias] = num;
});

function resolveNumericQuizId(id) {
  const str = String(id);
  if (/^\d+$/.test(str)) return str;
  if (REVERSE_LEGACY_QUIZ_MAP[str]) return REVERSE_LEGACY_QUIZ_MAP[str];
  const numMatch = str.match(/\d+/);
  return numMatch ? numMatch[0] : str;
}

function resolveAliasQuizId(id) {
  const str = String(id);
  if (LEGACY_SEEDED_QUIZ_MAP[str]) return LEGACY_SEEDED_QUIZ_MAP[str];
  return str;
}

// ---------------------------------------------------------------------------
// Standard Curriculum Questions fallback for quizzes 101-106
// ---------------------------------------------------------------------------
const CURRICULUM_QUESTIONS = {
  101: [
    { id: 'mq1', question: 'What is the HCF of 12 and 18?', options: ['2', '4', '6', '12'], correctIndex: 2, explanation: 'HCF(12,18) = 6.', points: 10, topic: 'Real Numbers' },
    { id: 'mq2', question: 'Which of the following is an irrational number?', options: ['0.333...', '√4', '√7', '22/7'], correctIndex: 2, explanation: '√7 cannot be expressed as p/q with integers.', points: 10, topic: 'Real Numbers' },
    { id: 'mq3', question: 'What are the zeroes of the quadratic polynomial x² - 5x + 6?', options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'], correctIndex: 0, explanation: '(x-2)(x-3)=0 => x = 2, 3.', points: 10, topic: 'Polynomials' },
    { id: 'mq4', question: 'If α and β are roots of ax² + bx + c = 0, then α + β equals:', options: ['b/a', '-b/a', 'c/a', '-c/a'], correctIndex: 1, explanation: 'Sum of roots is -b/a.', points: 10, topic: 'Algebra & Equations' },
    { id: 'mq5', question: 'The discriminant of 2x² - 4x + 3 = 0 is:', options: ['8', '-8', '16', '-16'], correctIndex: 1, explanation: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8.', points: 10, topic: 'Algebra & Equations' },
  ],
  102: [
    { id: 'sq1', question: 'What type of reaction is 2Mg + O₂ → 2MgO?', options: ['Decomposition', 'Combination', 'Displacement', 'Double displacement'], correctIndex: 1, explanation: 'Two reactants combine to form a single product.', points: 10, topic: 'Chemical Reactions' },
    { id: 'sq2', question: 'In photosynthesis, light energy is converted into:', options: ['Mechanical energy', 'Chemical energy', 'Thermal energy', 'Nuclear energy'], correctIndex: 1, explanation: 'Chlorophyll absorbs sunlight to synthesize carbohydrates (chemical energy).', points: 10, topic: 'Life Processes' },
    { id: 'sq3', question: 'Which organelle is called the powerhouse of the cell?', options: ['Ribosome', 'Golgi apparatus', 'Mitochondria', 'Endoplasmic reticulum'], correctIndex: 2, explanation: 'ATP synthesis takes place in the mitochondria.', points: 10, topic: 'Cell Biology' },
    { id: 'sq4', question: 'What is the SI unit of electric current?', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], correctIndex: 2, explanation: 'Electric current is measured in Amperes (A).', points: 10, topic: 'Electricity' },
    { id: 'sq5', question: 'The pH of an acidic solution is always:', options: ['Equal to 7', 'Greater than 7', 'Less than 7', 'Equal to 14'], correctIndex: 2, explanation: 'Acidic solutions have pH < 7.', points: 10, topic: 'Acids and Bases' },
  ],
  103: [
    { id: 'eq1', question: 'Who is the author of "A Letter to God"?', options: ['Liam O’Flaherty', 'G.L. Fuentes', 'Nelson Mandela', 'Robert Frost'], correctIndex: 1, explanation: '"A Letter to God" was written by G.L. Fuentes.', points: 10, topic: 'Literature' },
    { id: 'eq2', question: 'What did Lencho compare the raindrops to?', options: ['Gold coins', 'New coins', 'Silver pearls', 'Diamonds'], correctIndex: 1, explanation: 'Lencho compared the big drops to ten cent pieces and little ones to fives.', points: 10, topic: 'Literature' },
    { id: 'eq3', question: 'Choose the correct sentence:', options: ['Neither the teacher nor the students was present.', 'Neither the teacher nor the students were present.', 'Neither the teacher or the students was present.', 'Either the teacher nor the students were present.'], correctIndex: 1, explanation: 'When subjects are connected by neither/nor, the verb agrees with the closer subject.', points: 10, topic: 'Grammar' },
    { id: 'eq4', question: 'What is the antonym of "affluent"?', options: ['Wealthy', 'Impoverished', 'Prosperous', 'Opulent'], correctIndex: 1, explanation: 'Affluent means rich; impoverished means poor.', points: 10, topic: 'Vocabulary' },
    { id: 'eq5', question: 'Change to passive voice: "The chef cooked a delicious meal."', options: ['A delicious meal was cooked by the chef.', 'A delicious meal is cooked by the chef.', 'A delicious meal had been cooked by the chef.', 'A delicious meal has cooked by the chef.'], correctIndex: 0, explanation: 'Simple past passive is was/were + past participle.', points: 10, topic: 'Grammar' },
  ],
  104: [
    { id: 'hq1', question: 'कबीर के अनुसार ‘मीठी वाणी’ बोलने से क्या लाभ होता है?', options: ['औरों को सुख और तन को शीतलता मिलती है', 'धन की प्राप्ति होती है', 'शत्रु पराजित होते हैं', 'मान-सम्मान कम होता है'], correctIndex: 0, explanation: 'ऐसी बाणी बोलिये, मन का आपा खोइ। औरन को सीतल करै, आपहु सीतल होइ॥', points: 10, topic: 'साखी' },
    { id: 'hq2', question: 'मीराबाई किसकी अनन्य भक्त थीं?', options: ['श्री राम', 'श्री कृष्ण', 'शिवजी', 'हनुमान जी'], correctIndex: 1, explanation: 'मीराबाई गिरिधर गोपाल (श्री कृष्ण) की अनन्य भक्त थीं।', points: 10, topic: 'पद' },
    { id: 'hq3', question: '‘राजपुत्र’ में कौन-सा समास है?', options: ['द्विगु समास', 'द्वंद्व समास', 'तत्पुरुष समास', 'अव्ययीभाव समास'], correctIndex: 2, explanation: 'राजा का पुत्र = तत्पुरुष समास (संबंध तत्पुरुष)।', points: 10, topic: 'समास' },
    { id: 'hq4', question: '‘अंगूठा दिखाना’ मुहावरे का सही अर्थ क्या है?', options: ['साफ मना करना', 'मदद करना', 'चिढ़ाना', 'जीत जाना'], correctIndex: 0, explanation: 'अंगूठा दिखाना अर्थात वक्त पर साफ इंकार कर देना।', points: 10, topic: 'मुहावरे' },
    { id: 'hq5', question: '‘सूर्य’ का पर्यायवाची शब्द नहीं है:', options: ['दिनकर', 'रवि', 'शशि', 'भास्कर'], correctIndex: 2, explanation: '‘शशि’ चंद्रमा का पर्यायवाची है, सूर्य का नहीं।', points: 10, topic: 'पर्यायवाची' },
  ],
  105: [
    { id: 'ssq1', question: 'When did the French Revolution begin?', options: ['1776', '1789', '1804', '1815'], correctIndex: 1, explanation: 'The French Revolution began in 1789.', points: 10, topic: 'History' },
    { id: 'ssq2', question: 'Who hosted the Congress of Vienna in 1815?', options: ['Duke Metternich', 'Giuseppe Mazzini', 'Otto von Bismarck', 'Napoleon Bonaparte'], correctIndex: 0, explanation: 'Austrian Chancellor Duke Metternich hosted the Congress of Vienna.', points: 10, topic: 'History' },
    { id: 'ssq3', question: 'Black soil is also known as:', options: ['Bangar soil', 'Regur soil', 'Laterite soil', 'Alluvial soil'], correctIndex: 1, explanation: 'Black soil is called Regur soil and is ideal for growing cotton.', points: 10, topic: 'Geography' },
    { id: 'ssq4', question: 'Which level of government in India has powers to legislate on the Concurrent List?', options: ['Only Union Government', 'Only State Government', 'Both Union and State Governments', 'Local Panchayats'], correctIndex: 2, explanation: 'Both Central and State governments can make laws on items in the Concurrent List.', points: 10, topic: 'Civics' },
    { id: 'ssq5', question: 'Tertiary sector activities include:', options: ['Agriculture and fishing', 'Manufacturing and construction', 'Transport, banking, and communications', 'Mining and quarrying'], correctIndex: 2, explanation: 'Tertiary sector provides services such as transport, banking, and communications.', points: 10, topic: 'Economics' },
  ],
  106: [
    { id: 'csq1', question: 'Which data type is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correctIndex: 2, explanation: 'Lists can be modified after creation (mutable).', points: 10, topic: 'Python Basics' },
    { id: 'csq2', question: 'What is the output of print(2 ** 3)?', options: ['6', '8', '9', '5'], correctIndex: 1, explanation: '** is the exponentiation operator: 2³ = 8.', points: 10, topic: 'Python Basics' },
    { id: 'csq3', question: 'Which keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], correctIndex: 2, explanation: 'In Python, functions are defined using "def".', points: 10, topic: 'Functions' },
    { id: 'csq4', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Standard Question Language', 'Simple Query Logic', 'System Query Language'], correctIndex: 0, explanation: 'SQL stands for Structured Query Language.', points: 10, topic: 'Databases' },
    { id: 'csq5', question: 'A trail of data you leave behind while browsing online is called:', options: ['Digital Footprint', 'Cyber Space', 'Cookie Jar', 'Cache Trace'], correctIndex: 0, explanation: 'Digital footprint refers to traceable digital activities.', points: 10, topic: 'Cyber Ethics' },
  ],
};

// ---------------------------------------------------------------------------
// 1. Get Students for Teacher View (Class 10 default)
// ---------------------------------------------------------------------------
function getTeacherStudentsFromDb(classGrade = 10) {
  const cacheKey = String(classGrade);
  const cached = serverCache.teacherStudents.get(cacheKey);
  if (isFresh(cached)) {
    return cached.data;
  }
  const studentsQuery = `
    SELECT 
      u.id, 
      CONCAT(u.first_name, ' ', u.last_name) as name, 
      u.email,
      u.class_grade as classGrade,
      u.student_school_id as studentSchoolId,
      u.avatar_url as avatarUrl,
      COUNT(a.id) as quizzesCompleted, 
      COALESCE(ROUND(AVG(a.percentage)), 0) as avgScore, 
      u.total_xp as totalXP, 
      u.current_level as level, 
      u.current_streak as streak,
      COALESCE(SUM(ROUND(a.time_taken_seconds / 60)), 0) as studyMinutes
    FROM acadevia_auth_db.users u 
    LEFT JOIN acadevia_quiz_db.quiz_attempts a ON u.id = a.user_id 
    WHERE u.class_grade = ${classGrade} AND u.role = 'STUDENT' AND u.id BETWEEN 20 AND 29
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.class_grade, u.student_school_id, u.avatar_url, u.total_xp, u.current_level, u.current_streak
    ORDER BY totalXP DESC;
  `;

  const attemptsQuery = `
    SELECT 
      a.id, 
      a.quiz_id as quizId, 
      a.user_id as studentId, 
      CONCAT(u.first_name, ' ', u.last_name) as studentName,
      q.title as quizTitle,
      q.subject,
      ${classGrade} as classGrade,
      q.created_by as teacherId,
      a.percentage,
      a.score,
      a.total_marks as maxScore,
      a.is_passed as passed,
      a.total_questions as totalQuestions,
      a.correct_answers as correctAnswers,
      a.wrong_answers as wrongAnswers,
      a.time_taken_seconds as timeTakenSeconds,
      a.xp_earned as xpEarned,
      a.completed_at as completedAt
    FROM acadevia_quiz_db.quiz_attempts a
    JOIN acadevia_quiz_db.quizzes q ON a.quiz_id = q.id
    JOIN acadevia_auth_db.users u ON a.user_id = u.id
    WHERE a.user_id BETWEEN 20 AND 29
    ORDER BY a.id ASC;
  `;

  const students = execSql(studentsQuery);
  const attempts = execSql(attemptsQuery);

  const result = students.map((st) => {
    const studentAttempts = attempts.filter((att) => String(att.studentId) === String(st.id));
    const avgScore = Number(st.avgScore) || 0;
    const totalXP = Number(st.totalXP) || 0;
    const streak = Number(st.streak) || 0;
    const quizzesCompleted = studentAttempts.length;

    return {
      id: String(st.id),
      name: st.name,
      email: st.email,
      avatar: st.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(st.name)}`,
      className: `Class ${st.classGrade || 10}`,
      section: 'A',
      totalXP,
      quizzesCompleted,
      avgScore,
      streak,
      progress: Math.min(100, Math.round((quizzesCompleted / 6) * 100)),
      studyMinutes: Number(st.studyMinutes) || 0,
      results: studentAttempts.map((att) => ({
        id: `att-${att.id}`,
        quizId: resolveAliasQuizId(att.quizId),
        numericQuizId: String(att.quizId),
        quizTitle: att.quizTitle,
        subject: att.subject,
        studentId: String(att.studentId),
        studentName: att.studentName,
        classGrade: Number(classGrade),
        teacherId: String(att.teacherId),
        score: Number(att.score),
        totalPoints: Number(att.maxScore),
        percentage: Number(att.percentage),
        passed: att.passed === '1',
        totalQuestions: Number(att.totalQuestions),
        correctAnswers: Number(att.correctAnswers),
        wrongAnswers: Number(att.wrongAnswers),
        timeTakenSeconds: Number(att.timeTakenSeconds),
        xpEarned: Number(att.xpEarned),
        completedAt: att.completedAt,
      })),
      activities: [],
    };
  });

  serverCache.teacherStudents.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

// ---------------------------------------------------------------------------
// 2. Get Teacher Analytics
// ---------------------------------------------------------------------------
function getTeacherAnalyticsFromDb(classGrade = 10, subject = 'All') {
  const cacheKey = `${classGrade}_${subject}`;
  const cached = serverCache.teacherAnalytics.get(cacheKey);
  if (isFresh(cached)) {
    return cached.data;
  }
  const students = getTeacherStudentsFromDb(classGrade);
  const totalStudents = students.length;

  const allAttempts = students.flatMap((s) => s.results);
  const filteredAttempts = subject && subject !== 'All'
    ? allAttempts.filter((att) => att.subject.toLowerCase() === subject.toLowerCase())
    : allAttempts;

  // 1. Quizzes summary
  const quizMap = {};
  filteredAttempts.forEach((att) => {
    if (!quizMap[att.quizId]) {
      quizMap[att.quizId] = {
        id: att.quizId,
        name: att.quizTitle.length > 22 ? att.quizTitle.substring(0, 20) + '...' : att.quizTitle,
        fullName: att.quizTitle,
        totalScore: 0,
        count: 0,
      };
    }
    quizMap[att.quizId].totalScore += att.percentage;
    quizMap[att.quizId].count += 1;
  });

  const quizScores = Object.values(quizMap).map((q) => ({
    id: q.id,
    name: q.name,
    fullName: q.fullName,
    avg: q.count > 0 ? Math.round(q.totalScore / q.count) : 0,
    attempts: q.count,
  }));

  // 2. Completion rate
  const submittedStudentIds = new Set(filteredAttempts.map((att) => att.studentId));
  const completedCount = submittedStudentIds.size;
  const notStartedCount = Math.max(0, totalStudents - completedCount);
  const completedPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const notStartedPct = Math.max(0, 100 - completedPct);

  const completionData = [
    { name: 'Completed', value: completedPct, count: completedCount, color: '#5B2C6F' },
    { name: 'In Progress', value: 0, count: 0, color: '#f59e0b' },
    { name: 'Not Started', value: notStartedPct, count: notStartedCount, color: '#ef4444' },
  ];

  // 3. Engagement trend (30 days)
  const now = new Date();
  const engagementTrend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayAttempts = filteredAttempts.filter((att) => (att.completedAt || '').startsWith(dateStr));
    engagementTrend.push({
      day: dayLabel,
      date: dateStr,
      engagement: dayAttempts.length,
    });
  }

  // 4. Top performers & at-risk
  const studentMap = {};
  filteredAttempts.forEach((att) => {
    if (!studentMap[att.studentId]) {
      studentMap[att.studentId] = {
        id: att.studentId,
        name: att.studentName,
        totalScore: 0,
        count: 0,
        totalXP: 0,
      };
    }
    studentMap[att.studentId].totalScore += att.percentage;
    studentMap[att.studentId].count += 1;
    studentMap[att.studentId].totalXP += att.xpEarned;
  });

  const studentStats = Object.values(studentMap).map((s) => ({
    id: s.id,
    name: s.name,
    score: Math.round(s.totalScore / s.count),
    xp: s.totalXP,
    quizzesTaken: s.count,
  }));

  const topPerformers = [...studentStats]
    .sort((a, b) => b.score - a.score || b.xp - a.xp)
    .slice(0, 5);

  const atRiskStudents = studentStats
    .filter((s) => s.score < 50)
    .map((s) => ({
      id: s.id,
      name: s.name,
      score: s.score,
      lastActive: 'Recently',
    }));

  // 5. Subject comparison across all class subjects
  const classSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  const subjectComparison = classSubjects.map((sub) => {
    const subAttempts = allAttempts.filter((att) => att.subject.toLowerCase() === sub.toLowerCase());
    const score = subAttempts.length > 0
      ? Math.round(subAttempts.reduce((sum, att) => sum + att.percentage, 0) / subAttempts.length)
      : 0;
    return {
      subject: sub === 'Social Science' ? 'Social' : sub,
      score,
      submissions: subAttempts.length,
    };
  });

  const result = {
    classGrade: Number(classGrade),
    availableClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    subject: subject || 'All',
    availableSubjects: ['All', ...classSubjects],
    totalStudents,
    quizScores,
    completionData,
    engagementTrend,
    topPerformers,
    atRiskStudents,
    subjectComparison,
  };

  serverCache.teacherAnalytics.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

// ---------------------------------------------------------------------------
// 3. Get All Users (Students and Teachers) with Real Metrics
// ---------------------------------------------------------------------------
function getUsersFromDb() {
  const usersQuery = `
    SELECT 
      u.id,
      u.email,
      CONCAT(u.first_name, ' ', u.last_name) as fullName,
      u.role,
      u.avatar_url as avatarUrl,
      'Acadevia Demo School' as schoolName,
      u.class_grade as classGrade,
      'A' as section,
      u.student_school_id as studentSchoolId,
      u.total_xp as totalXP,
      u.current_level as currentLevel,
      u.current_streak as currentStreak,
      u.longest_streak as longestStreak,
      COUNT(a.id) as lessonsCompleted,
      COALESCE(SUM(ROUND(a.time_taken_seconds / 60)), 0) as studyMinutes
    FROM acadevia_auth_db.users u
    LEFT JOIN acadevia_quiz_db.quiz_attempts a ON u.id = a.user_id
    GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.avatar_url, u.class_grade, u.student_school_id, u.total_xp, u.current_level, u.current_streak, u.longest_streak
    ORDER BY u.id ASC;
  `;

  const rows = execSql(usersQuery);

  const TEACHER_META = {
    '8': { subject: 'Mathematics', subjectsTaught: ['Mathematics', 'Science', 'Physics'], classesTaught: [8, 9, 10, 11, 12], assignedStudentIds: ['9', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Senior Faculty • Mathematics & Science' },
    '10': { subject: 'Mathematics', subjectsTaught: ['Mathematics'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Department Head • Mathematics' },
    '11': { subject: 'Science', subjectsTaught: ['Science', 'Physics', 'Chemistry'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Senior Faculty • Science' },
    '12': { subject: 'English', subjectsTaught: ['English'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Senior Faculty • English Language & Literature' },
    '13': { subject: 'Hindi', subjectsTaught: ['Hindi'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Senior Faculty • Hindi' },
    '14': { subject: 'Social Science', subjectsTaught: ['Social Science', 'History', 'Civics'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Senior Faculty • Social Science' },
    '15': { subject: 'Computer Science', subjectsTaught: ['Computer Science', 'Informatics Practices'], classesTaught: [10], assignedStudentIds: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], designation: 'Lead Faculty • Computer Science & AI' },
  };

  const STUDENT_TEACHER_MAP = {
    '9': '8',
    '20': '10',
    '21': '11',
    '22': '10',
    '23': '12',
    '24': '10',
    '25': '13',
    '26': '14',
    '27': '15',
    '28': '11',
    '29': '12',
  };

  return rows.map((r) => {
    const sId = String(r.id);
    const isTeacher = r.role === 'TEACHER';
    const teacherMeta = TEACHER_META[sId] || {};

    return {
      id: sId,
      email: r.email,
      fullName: r.fullName.trim(),
      role: r.role,
      avatarUrl: r.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.fullName)}`,
      schoolName: r.schoolName || 'Acadevia Demo School',
      classGrade: r.classGrade ? Number(r.classGrade) : undefined,
      section: r.section || 'A',
      studentSchoolId: r.studentSchoolId || r.email.split('@')[0],
      username: r.email.split('@')[0],
      location: 'New Delhi, India',
      joinDate: 'January 2024',
      totalXP: Number(r.totalXP) || 0,
      currentLevel: Number(r.currentLevel) || 1,
      currentStreak: Number(r.currentStreak) || 0,
      longestStreak: Number(r.longestStreak) || Number(r.currentStreak) || 0,
      lessonsCompleted: Number(r.lessonsCompleted) || 0,
      studyMinutes: Number(r.studyMinutes) || 0,
      coursesCompleted: Number(r.lessonsCompleted) >= 6 ? 6 : Math.floor((Number(r.lessonsCompleted) || 0) / 2),
      teacherId: !isTeacher ? (STUDENT_TEACHER_MAP[sId] || '10') : undefined,
      enrolledSubjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'],
      ...teacherMeta,
    };
  });
}

// ---------------------------------------------------------------------------
// 4. Get Quizzes with Questions
// ---------------------------------------------------------------------------
function getQuizzesFromDb() {
  if (isFresh(serverCache.quizzes)) {
    return serverCache.quizzes.data;
  }
  const quizzesQuery = `
    SELECT 
      q.id,
      q.title,
      q.description,
      q.subject,
      q.class_grade as classGrade,
      q.time_limit_minutes as timeLimitMinutes,
      q.difficulty_level as difficulty,
      q.xp_reward as xpReward,
      q.created_by as teacherId,
      q.assigned_to_student_id as assignedStudentId,
      CONCAT(u.first_name, ' ', u.last_name) as teacherName,
      q.created_at as createdAt,
      q.chapter_info as chapterInfo
    FROM acadevia_quiz_db.quizzes q
    LEFT JOIN acadevia_auth_db.users u ON q.created_by = u.id
    WHERE q.is_active = 1
    ORDER BY q.id ASC;
  `;

  const rows = execSql(quizzesQuery);

  const questionsQuery = `
    SELECT 
      id,
      quiz_id as quizId,
      question_text as question,
      option_a as optA,
      option_b as optB,
      option_c as optC,
      option_d as optD,
      correct_answer as correctAnswer,
      explanation,
      marks as points,
      topic
    FROM acadevia_quiz_db.questions
    WHERE is_active = 1
    ORDER BY id ASC;
  `;
  const dbQuestions = execSql(questionsQuery);

  const questionMap = {};
  dbQuestions.forEach((q) => {
    const qId = String(q.quizId);
    if (!questionMap[qId]) questionMap[qId] = [];
    const options = [q.optA, q.optB, q.optC, q.optD].filter(Boolean);
    let correctIndex = 0;
    const ans = (q.correctAnswer || 'A').toUpperCase().trim();
    if (ans === 'B' || ans === '1') correctIndex = 1;
    else if (ans === 'C' || ans === '2') correctIndex = 2;
    else if (ans === 'D' || ans === '3') correctIndex = 3;

    questionMap[qId].push({
      id: `q-${q.id}`,
      question: q.question,
      options,
      correctIndex,
      explanation: q.explanation || '',
      points: Number(q.points) || 10,
      topic: q.topic || 'General',
    });
  });

  const result = rows.map((q) => {
    const numericId = String(q.id);
    const aliasId = resolveAliasQuizId(numericId);
    const fallbackQuestions = CURRICULUM_QUESTIONS[Number(numericId)] || [];
    const questions = (questionMap[numericId] && questionMap[numericId].length > 0)
      ? questionMap[numericId]
      : fallbackQuestions;

    return {
      id: aliasId,
      numericId,
      teacherId: String(q.teacherId || '10'),
      teacherName: (q.teacherName && q.teacherName !== 'NULL' && q.teacherName.trim()) ? q.teacherName.trim() : (String(q.teacherId) === '10' ? 'NCERT AI Tutor' : 'Faculty'),
      classGrade: Number(q.classGrade) || 10,
      subject: q.subject,
      chapter: q.chapterInfo || '',
      chapterInfo: q.chapterInfo || '',
      title: q.title,
      description: q.description || '',
      timeLimit: (Number(q.timeLimitMinutes) || 5) * 60,
      difficulty: (q.difficulty || 'medium').toLowerCase(),
      xpReward: Number(q.xpReward) || 50,
      assignedStudentId: (q.assignedStudentId && q.assignedStudentId !== 'NULL') ? String(q.assignedStudentId) : undefined,
      isAiGenerated: String(q.teacherId) === '10' || !!(q.assignedStudentId && q.assignedStudentId !== 'NULL'),
      createdAt: q.createdAt || new Date().toISOString(),
      questions,
    };
  });
  serverCache.quizzes = { data: result, timestamp: Date.now() };
  return result;
}

function getQuizByIdFromDb(quizId) {
  if (!quizId) return null;
  const targetId = String(quizId).toLowerCase().trim();
  const quizzes = getQuizzesFromDb();
  return quizzes.find((q) => {
    const idStr = String(q.id).toLowerCase().trim();
    const numIdStr = q.numericId ? String(q.numericId).toLowerCase().trim() : '';
    return idStr === targetId || numIdStr === targetId;
  }) || null;
}

// ---------------------------------------------------------------------------
// 5. Get Quiz Attempts
// ---------------------------------------------------------------------------
function getQuizAttemptsFromDb() {
  if (isFresh(serverCache.quizAttempts)) {
    return serverCache.quizAttempts.data;
  }
  const query = `
    SELECT 
      a.id,
      a.quiz_id as quizId,
      a.user_id as studentId,
      CONCAT(u.first_name, ' ', u.last_name) as studentName,
      q.title as quizTitle,
      q.subject,
      q.class_grade as classGrade,
      q.created_by as teacherId,
      a.score,
      a.total_marks as totalPoints,
      a.percentage,
      a.xp_earned as xpEarned,
      a.time_taken_seconds as timeTakenSeconds,
      a.completed_at as completedAt
    FROM acadevia_quiz_db.quiz_attempts a
    JOIN acadevia_quiz_db.quizzes q ON a.quiz_id = q.id
    JOIN acadevia_auth_db.users u ON a.user_id = u.id
    ORDER BY a.id ASC;
  `;

  const rows = execSql(query);
  return rows.map((r) => ({
    id: `res-${r.id}`,
    quizId: resolveAliasQuizId(r.quizId),
    numericQuizId: String(r.quizId),
    quizTitle: r.quizTitle,
    studentId: String(r.studentId),
    studentName: r.studentName.trim(),
    teacherId: String(r.teacherId),
    classGrade: Number(r.classGrade || 10),
    subject: r.subject,
    score: Number(r.score),
    totalPoints: Number(r.totalPoints),
    percentage: Number(r.percentage),
    answers: [],
    completedAt: r.completedAt,
    xpEarned: Number(r.xpEarned),
    timeTakenSeconds: Number(r.timeTakenSeconds) || 180,
  }));
}

// ---------------------------------------------------------------------------
// 6. Submit Quiz Attempt to Database & Update Student XP / Streaks
// ---------------------------------------------------------------------------
function submitAttemptToDb(params) {
  const numericQuizId = resolveNumericQuizId(params.quizId);
  const studentId = Number(params.studentId);
  const answers = Array.isArray(params.answers) ? params.answers : [];
  const timeTakenSeconds = Number(params.timeTakenSeconds) || 180;
  const completedAt = params.completedAt || new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Fetch quiz to calculate score
  const quizzes = getQuizzesFromDb();
  const quiz = quizzes.find((q) => q.numericId === String(numericQuizId) || q.id === params.quizId);

  let score = 0;
  let totalMarks = quiz?.questions?.reduce((acc, q) => acc + q.points, 0) || 50;
  let correctCount = 0;
  let wrongCount = 0;

  if (quiz && quiz.questions && quiz.questions.length > 0) {
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctIndex) {
        score += q.points;
        correctCount++;
      } else {
        wrongCount++;
      }
    });
  } else {
    score = 40;
    totalMarks = 50;
    correctCount = 4;
    wrongCount = 1;
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 80;
  const baseReward = Number(quiz?.xpReward) || 50;
  const xpEarned = Math.max(score * 10, baseReward);
  const isPassed = percentage >= 60 ? 1 : 0;
  const answersJson = JSON.stringify(answers).replace(/'/g, "\\'");

  const insertSql = `
    INSERT INTO acadevia_quiz_db.quiz_attempts
    (quiz_id, user_id, status, attempt_number, score, total_marks, percentage, is_passed, total_questions, correct_answers, wrong_answers, time_taken_seconds, xp_earned, answers_json, completed_at)
    VALUES
    (${numericQuizId}, ${studentId}, 'SUBMITTED', 1, ${score}, ${totalMarks}, ${percentage}, ${isPassed}, ${answers.length || 5}, ${correctCount}, ${wrongCount}, ${timeTakenSeconds}, ${xpEarned}, '${answersJson}', '${completedAt}');
  `;
  execSqlMutation(insertSql);

  // Update Student XP, Level, and Streak in acadevia_auth_db.users
  const updateStudentSql = `
    UPDATE acadevia_auth_db.users
    SET 
      total_xp = total_xp + ${xpEarned},
      current_level = FLOOR((total_xp + ${xpEarned}) / 500) + 1,
      current_streak = GREATEST(current_streak, 1),
      longest_streak = GREATEST(longest_streak, current_streak, 1)
    WHERE id = ${studentId};
  `;
  execSqlMutation(updateStudentSql);
  invalidateServerCache();

  return {
    id: `res-${Date.now()}`,
    quizId: resolveAliasQuizId(numericQuizId),
    numericQuizId: String(numericQuizId),
    quizTitle: quiz?.title || 'Class Assessment',
    studentId: String(studentId),
    studentName: 'Student',
    teacherId: quiz?.teacherId || '10',
    classGrade: quiz?.classGrade || 10,
    subject: quiz?.subject || 'Mathematics',
    score,
    totalPoints: totalMarks,
    percentage,
    answers,
    completedAt,
    xpEarned,
    timeTakenSeconds,
  };
}

// ---------------------------------------------------------------------------
// 7. Teacher Creates Quiz in Database
// ---------------------------------------------------------------------------
function createQuizInDb(data) {
  const teacherId = Number(data.teacherId) || 10;
  const classGrade = Number(data.classGrade) || 10;
  const subject = (data.subject || 'Mathematics').replace(/'/g, "\\'");
  const title = (data.title || 'New Assessment').replace(/'/g, "\\'");
  const description = (data.description || '').replace(/'/g, "\\'");
  const chapterInfo = (data.chapterInfo || data.chapter || '').replace(/'/g, "\\'");
  const chapterSql = chapterInfo ? `'${chapterInfo}'` : 'NULL';
  const timeLimitMin = Math.max(1, Math.round((Number(data.timeLimit) || 300) / 60));
  const difficulty = (data.difficulty || 'MEDIUM').toUpperCase();
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const totalQuestions = questions.length || 5;
  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.points) || 10), 0) || 50;
  const xpReward = Math.max(10, Math.min(500, Number(data.xpReward) || 50));
  const assignedStudentId = (data.assignedStudentId || data.studentId) ? Number(data.assignedStudentId || data.studentId) : null;
  const assignedSql = assignedStudentId ? `${assignedStudentId}` : 'NULL';

  const sqlStatements = [
    'START TRANSACTION;',
    `INSERT INTO acadevia_quiz_db.quizzes
     (title, description, subject, class_grade, chapter_info, time_limit_minutes, difficulty_level, xp_reward, is_active, created_by, assigned_to_student_id)
     VALUES
     ('${title}', '${description}', '${subject}', ${classGrade}, ${chapterSql}, ${timeLimitMin}, '${difficulty}', ${xpReward}, 1, ${teacherId}, ${assignedSql});`,
    'SET @new_quiz_id = LAST_INSERT_ID();',
  ];

  const letters = ['A', 'B', 'C', 'D'];
  questions.forEach((q, idx) => {
    const qText = (q.question || `Question ${idx + 1}`).replace(/'/g, "\\'");
    const optA = (q.options?.[0] || 'Option A').replace(/'/g, "\\'");
    const optB = (q.options?.[1] || 'Option B').replace(/'/g, "\\'");
    const optC = (q.options?.[2] || 'Option C').replace(/'/g, "\\'");
    const optD = (q.options?.[3] || 'Option D').replace(/'/g, "\\'");
    const correctLetter = letters[q.correctIndex] || 'A';
    const explanation = (q.explanation || '').replace(/'/g, "\\'");
    const points = Number(q.points) || 10;
    const topic = (q.topic || title).replace(/'/g, "\\'");

    sqlStatements.push(`
      INSERT INTO acadevia_quiz_db.questions
      (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, topic, is_active)
      VALUES
      (@new_quiz_id, '${qText}', '${optA}', '${optB}', '${optC}', '${optD}', '${correctLetter}', '${explanation}', ${points}, '${topic}', 1);
    `);
  });

  sqlStatements.push('COMMIT;');
  sqlStatements.push('SELECT @new_quiz_id as id;');

  const combinedSql = sqlStatements.join('\n');
  const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot';
  let out;
  try {
    out = execSync(cmd, { input: combinedSql, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
  } catch (err) {
    console.error('createQuizInDb transaction failed:', err.message);
    throw new Error(`Failed to create quiz in MySQL: ${err.message}`);
  }

  // Parse stdout for the returned @new_quiz_id
  const lines = out.split('\n').map((l) => l.trim()).filter(Boolean);
  const idIndex = lines.indexOf('id');
  const newQuizId = idIndex >= 0 && lines[idIndex + 1] ? lines[idIndex + 1] : null;

  if (!newQuizId || newQuizId === '0') {
    throw new Error(`Failed to retrieve real inserted quiz ID from MySQL. Output was: ${out}`);
  }

  invalidateServerCache();

  return {
    id: String(newQuizId),
    numericId: String(newQuizId),
    teacherId: String(teacherId),
    teacherName: data.teacherName || (String(teacherId) === '10' ? 'NCERT AI Tutor' : 'Teacher'),
    classGrade,
    subject: data.subject,
    chapter: chapterInfo,
    chapterInfo,
    title: data.title,
    description: data.description,
    timeLimit: Number(data.timeLimit) || 300,
    difficulty: (data.difficulty || 'medium').toLowerCase(),
    xpReward,
    assignedStudentId: assignedStudentId ? String(assignedStudentId) : undefined,
    isAiGenerated: String(teacherId) === '10' || !!assignedStudentId || !!data.isAiGenerated,
    questions: questions.map((q, idx) => ({
      id: q.id || `q-${idx}`,
      question: q.question,
      options: q.options || [],
      correctIndex: q.correctIndex || 0,
      explanation: q.explanation || '',
      points: Number(q.points) || 10,
      topic: q.topic || data.title,
    })),
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 7.5 Delete / Archive Quiz (With Role & Ownership Authorization)
// ---------------------------------------------------------------------------
function deleteQuizFromDb({ quizId, requestingUserId, requestingUserRole, authHeader }) {
  if (!quizId) {
    const err = new Error('Quiz ID is required');
    err.statusCode = 400;
    throw err;
  }

  // 1. Authenticate user from MySQL
  const reqUserId = Number(requestingUserId);
  if (!reqUserId || isNaN(reqUserId)) {
    const err = new Error('Authentication required to delete a quiz');
    err.statusCode = 401;
    throw err;
  }

  const userQuery = `SELECT id, role, is_active FROM acadevia_auth_db.users WHERE id = ${reqUserId} LIMIT 1;`;
  const userRows = execSql(userQuery);
  if (!userRows || userRows.length === 0 || Number(userRows[0].is_active) === 0) {
    const err = new Error('Authentication required: user not found or inactive');
    err.statusCode = 401;
    throw err;
  }

  const dbUser = userRows[0];
  const userRole = String(dbUser.role).toUpperCase();

  // 2. Authorize role (TEACHER or ADMIN only, Students NEVER allowed)
  if (userRole !== 'TEACHER' && userRole !== 'ADMIN' && userRole !== 'SCHOOL_ADMIN') {
    const err = new Error('Access denied: Only teachers and administrators can delete quizzes');
    err.statusCode = 403;
    throw err;
  }

  // 3. Resolve target quiz numeric ID using existing alias-resolution mechanism
  const resolvedStr = resolveNumericQuizId(quizId);
  const numericQuizId = Number(resolvedStr);

  if (!numericQuizId || isNaN(numericQuizId) || numericQuizId <= 0) {
    const err = new Error(`Quiz not found for ID: ${quizId}`);
    err.statusCode = 404;
    throw err;
  }

  // 4. Retrieve quiz from MySQL to verify ownership
  const quizQuery = `SELECT id, title, created_by as teacherId, is_active FROM acadevia_quiz_db.quizzes WHERE id = ${numericQuizId} LIMIT 1;`;
  const quizRows = execSql(quizQuery);
  if (!quizRows || quizRows.length === 0) {
    const err = new Error(`Quiz not found for ID: ${quizId}`);
    err.statusCode = 404;
    throw err;
  }

  const quiz = quizRows[0];

  // Check ownership: Teacher can only delete quizzes they created
  if (userRole !== 'ADMIN' && userRole !== 'SCHOOL_ADMIN' && Number(quiz.teacherId) !== reqUserId) {
    const err = new Error('Access denied: You are only authorized to delete quizzes that you created');
    err.statusCode = 403;
    throw err;
  }

  // 5. Check student attempts count
  const attemptCountQuery = `SELECT COUNT(*) as cnt FROM acadevia_quiz_db.quiz_attempts WHERE quiz_id = ${numericQuizId};`;
  const attemptRows = execSql(attemptCountQuery);
  const attemptCount = Number(attemptRows?.[0]?.cnt || 0);

  let mode = 'DELETED';
  let message = '';

  const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot';
  if (attemptCount > 0) {
    // Safe soft-delete / archive: preserves student attempts, answers, and XP
    const archiveSql = `
      START TRANSACTION;
      UPDATE acadevia_quiz_db.quizzes 
      SET is_active = 0, quiz_status = 'ARCHIVED', updated_at = NOW() 
      WHERE id = ${numericQuizId};
      UPDATE acadevia_quiz_db.questions 
      SET is_active = 0 
      WHERE quiz_id = ${numericQuizId};
      COMMIT;
    `;
    execSync(cmd, { input: archiveSql, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
    mode = 'ARCHIVED';
    message = `Quiz "${quiz.title}" has ${attemptCount} student submission(s) and was safely archived to preserve student history.`;
  } else {
    // Hard delete in atomic transaction (no student attempts exist)
    const deleteSql = `
      START TRANSACTION;
      DELETE FROM acadevia_quiz_db.questions WHERE quiz_id = ${numericQuizId};
      DELETE FROM acadevia_quiz_db.quizzes WHERE id = ${numericQuizId};
      COMMIT;
    `;
    execSync(cmd, { input: deleteSql, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
    mode = 'DELETED';
    message = `Quiz "${quiz.title}" was permanently deleted.`;
  }

  // 6. Invalidate caches and bump state version
  invalidateServerCache();

  return {
    success: true,
    quizId: String(quizId),
    numericId: String(numericQuizId),
    title: quiz.title,
    mode,
    message,
    attemptCount,
  };
}

// ---------------------------------------------------------------------------
// 8. Content Items (PDF, Video, Image) from acadevia_content_db
// ---------------------------------------------------------------------------
function getContentItemsFromDb() {
  if (isFresh(serverCache.contentItems)) {
    return serverCache.contentItems.data;
  }
  const query = `
    SELECT 
      id,
      title,
      description,
      class_number as classGrade,
      subject_name as subject,
      chapter_name as chapter,
      content_type as contentType,
      file_url as cloudinaryUrl,
      file_name as fileName,
      file_size as fileSize,
      mime_type as mimeType,
      thumbnail_url as thumbnailUrl,
      language,
      teacher_name as uploadedBy,
      duration_seconds as duration,
      created_at as uploadedAt
    FROM acadevia_content_db.content_items
    ORDER BY id DESC;
  `;
  const rows = execSql(query);
  const result = rows.map((r) => ({
    id: `cnt-${r.id}`,
    title: r.title,
    description: r.description || '',
    cloudinaryUrl: r.cloudinaryUrl,
    cloudinaryPublicId: '',
    thumbnailUrl: r.thumbnailUrl || '',
    subject: r.subject,
    classGrade: Number(r.classGrade) || 10,
    chapter: r.chapter,
    language: r.language || 'en',
    uploadedBy: r.uploadedBy || 'Teacher',
    uploadedAt: r.uploadedAt || new Date().toISOString(),
    fileSize: Number(r.fileSize) || 0,
    contentType: r.contentType,
    fileName: r.fileName,
    mimeType: r.mimeType,
  }));
  serverCache.contentItems = { data: result, timestamp: Date.now() };
  return result;
}

function createContentItemInDb(data) {
  const title = (data.title || 'Untitled').replace(/'/g, "\\'");
  const description = (data.description || '').replace(/'/g, "\\'");
  const classNumber = Number(data.classGrade || data.classNumber) || 10;
  const subjectName = (data.subject || data.subjectName || 'Science').replace(/'/g, "\\'");
  const chapterName = (data.chapter || data.chapterName || 'General').replace(/'/g, "\\'");
  const contentType = (data.contentType || 'PDF').toUpperCase();
  const fileUrl = (data.cloudinaryUrl || data.fileUrl || '').replace(/'/g, "\\'");
  const fileName = (data.fileName || `${title}.pdf`).replace(/'/g, "\\'");
  const mimeType = (data.mimeType || 'application/pdf').replace(/'/g, "\\'");
  const thumbnailUrl = (data.thumbnailUrl || '').replace(/'/g, "\\'");
  const fileSize = Number(data.fileSize) || 0;
  const teacherName = (data.uploadedBy || data.teacherName || 'Faculty').replace(/'/g, "\\'");

  const insertSql = `
    INSERT INTO acadevia_content_db.content_items
    (title, description, class_id, subject_id, chapter_id, class_number, subject_name, chapter_name, content_type, file_url, file_name, mime_type, thumbnail_url, file_size, language, teacher_name, status)
    VALUES
    ('${title}', '${description}', ${classNumber}, ${classNumber * 10}, 1, ${classNumber}, '${subjectName}', '${chapterName}', '${contentType}', '${fileUrl}', '${fileName}', '${mimeType}', '${thumbnailUrl}', ${fileSize}, 'en', '${teacherName}', 'PUBLISHED');
  `;
  execSqlMutation(insertSql);
  invalidateServerCache();

  return {
    id: `cnt-${Date.now()}`,
    title: data.title,
    description: data.description || '',
    cloudinaryUrl: fileUrl,
    thumbnailUrl,
    subject: subjectName,
    classGrade: classNumber,
    chapter: chapterName,
    language: 'en',
    uploadedBy: teacherName,
    uploadedAt: new Date().toISOString(),
    fileSize,
    contentType,
    fileName,
    mimeType,
  };
}

function deleteContentItemFromDb(id) {
  const numericId = String(id).replace(/\D/g, '');
  if (!numericId) return true;
  const res = execSqlMutation(`DELETE FROM acadevia_content_db.content_items WHERE id = ${numericId};`);
  invalidateServerCache();
  return res;
}

// ---------------------------------------------------------------------------
// 9. Full Shared State Snapshot (Single Fast Roundtrip for Multiple Devices)
// ---------------------------------------------------------------------------
function getFullDatabaseState() {
  if (isFresh(serverCache.fullState)) {
    return serverCache.fullState.data;
  }
  const users = getUsersFromDb();
  const quizzes = getQuizzesFromDb();
  const results = getQuizAttemptsFromDb();
  const contentItems = getContentItemsFromDb();

  // Activities synthesised directly from real quiz results and creations
  const activities = [];
  results.slice(-15).reverse().forEach((r) => {
    activities.push({
      id: `act-s-${r.id}`,
      userId: r.studentId,
      userRole: 'STUDENT',
      type: 'QUIZ_COMPLETED',
      title: `Completed Quiz: ${r.quizTitle}`,
      description: `Scored ${r.percentage}% (${r.score}/${r.totalPoints} pts) • ${r.subject}`,
      timestamp: r.completedAt || 'Recently',
      badgeText: `${r.percentage}% Score`,
    });
  });

  const result = {
    users,
    quizzes,
    results,
    activities,
    contentItems,
    stateVersion,
  };
  serverCache.fullState = { data: result, timestamp: Date.now() };
  return result;
}

// ---------------------------------------------------------------------------
// 10. Get Dynamic Leaderboard (Weekly, Monthly, All Time)
// ---------------------------------------------------------------------------
function getLeaderboardFromDb(period = 'alltime') {
  const normPeriod = (period || 'alltime').toLowerCase();
  const cached = serverCache.leaderboard.get(normPeriod);
  if (isFresh(cached)) {
    return cached.data;
  }

  const users = getUsersFromDb();
  const students = users.filter((u) => u.role === 'STUDENT');
  const attempts = getQuizAttemptsFromDb();

  const now = Date.now();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const entries = students.map((st) => {
    let xp = 0;
    const stAttempts = attempts.filter((a) => String(a.studentId) === String(st.id));

    if (normPeriod === 'weekly') {
      xp = stAttempts
        .filter((a) => a.completedAt && new Date(a.completedAt) >= oneWeekAgo)
        .reduce((sum, a) => sum + (Number(a.xpEarned) || 0), 0);
    } else if (normPeriod === 'monthly') {
      xp = stAttempts
        .filter((a) => a.completedAt && new Date(a.completedAt) >= oneMonthAgo)
        .reduce((sum, a) => sum + (Number(a.xpEarned) || 0), 0);
    } else {
      // 'alltime' - unconditional authoritative source: users.total_xp
      xp = st.totalXP ?? 0;
    }

    const displayName = (st.fullName || st.username || `Student #${st.id}`).trim();
    const rawAvatar = st.avatarUrl && st.avatarUrl !== 'NULL' && st.avatarUrl !== 'null' ? st.avatarUrl : '';
    const avatar = rawAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

    return {
      userId: String(st.id),
      name: displayName,
      avatar,
      level: Number(st.currentLevel) || 1,
      xp,
      streak: Number(st.currentStreak) || 0,
      change: 'same',
    };
  });

  // Sort descending by XP, then level, then name
  entries.sort((a, b) => b.xp - a.xp || b.level - a.level || a.name.localeCompare(b.name));

  // Assign sequential ranks: 1, 2, 3...
  const ranked = entries.map((entry, idx) => ({
    rank: idx + 1,
    ...entry,
  }));

  serverCache.leaderboard.set(normPeriod, { data: ranked, timestamp: Date.now() });
  return ranked;
}

// ---------------------------------------------------------------------------
// 11. Student Learning Progress & Continue Learning System
// ---------------------------------------------------------------------------
function getUserIdByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const clean = email.toLowerCase().trim().replace(/'/g, "\\'");
  try {
    const rows = execSql(`SELECT id FROM acadevia_auth_db.users WHERE email = '${clean}' LIMIT 1;`);
    if (rows && rows.length > 0 && rows[0].id) {
      return String(rows[0].id);
    }
  } catch {}
  return null;
}

function formatRemainingTime(durationSec, lastPosSec) {
  const dur = Number(durationSec) || 0;
  const pos = Number(lastPosSec) || 0;
  if (!dur) return 'In progress';
  const remaining = Math.max(0, dur - pos);
  if (remaining === 0) return 'Completed ✓';
  const mins = Math.ceil(remaining / 60);
  return `${mins} min left`;
}

function saveLearningProgress(params) {
  let rawStudentId = params.studentId;
  if (isNaN(Number(rawStudentId)) && typeof rawStudentId === 'string' && rawStudentId.includes('@')) {
    rawStudentId = getUserIdByEmail(rawStudentId) || rawStudentId;
  }
  const studentId = Number(rawStudentId) || 20;
  const contentId = String(params.contentId || '').trim();
  if (!contentId) {
    throw new Error('contentId is required for saving learning progress');
  }

  const courseId = params.courseId ? `'${String(params.courseId).replace(/'/g, "\\'")}'` : 'NULL';
  const subject = (params.subject || 'General').replace(/'/g, "\\'");
  const chapter = (params.chapter || 'General').replace(/'/g, "\\'");
  const classGrade = Number(params.classGrade) || 10;
  const title = (params.title || 'Lesson Video').replace(/'/g, "\\'");
  const description = (params.description || '').replace(/'/g, "\\'");
  const contentType = (params.contentType || 'VIDEO').toUpperCase().replace(/'/g, "\\'");
  const fileUrl = (params.fileUrl || '').replace(/'/g, "\\'");
  const thumbnailUrl = (params.thumbnailUrl || '').replace(/'/g, "\\'");
  const lastPos = Math.max(0, Math.round(Number(params.lastPositionSeconds) || 0));
  const duration = Math.max(0, Math.round(Number(params.durationSeconds) || 0));

  let progressPct = Number(params.progressPercent);
  if (isNaN(progressPct) || progressPct === undefined || progressPct === null) {
    progressPct = duration > 0 ? Math.min(100, Math.round((lastPos / duration) * 100)) : 0;
  } else {
    progressPct = Math.min(100, Math.max(0, Math.round(progressPct)));
  }

  const completed = (params.completed === true || progressPct >= 90) ? 1 : 0;
  let lastWatchedAt;
  try {
    const d = params.lastWatchedAt ? new Date(params.lastWatchedAt) : new Date();
    lastWatchedAt = isNaN(d.getTime())
      ? new Date().toISOString().slice(0, 19).replace('T', ' ')
      : d.toISOString().slice(0, 19).replace('T', ' ');
  } catch {
    lastWatchedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  const sql = `
    INSERT INTO acadevia_content_db.student_learning_progress
    (student_id, content_id, course_id, subject, chapter, class_grade, title, description, content_type, file_url, thumbnail_url, last_position_seconds, duration_seconds, progress_percent, completed, last_watched_at)
    VALUES
    (${studentId}, '${contentId.replace(/'/g, "\\'")}', ${courseId}, '${subject}', '${chapter}', ${classGrade}, '${title}', '${description}', '${contentType}', '${fileUrl}', '${thumbnailUrl}', ${lastPos}, ${duration}, ${progressPct}, ${completed}, '${lastWatchedAt}')
    ON DUPLICATE KEY UPDATE
      last_position_seconds = VALUES(last_position_seconds),
      duration_seconds = VALUES(duration_seconds),
      progress_percent = VALUES(progress_percent),
      completed = VALUES(completed),
      last_watched_at = VALUES(last_watched_at),
      title = VALUES(title),
      subject = VALUES(subject),
      chapter = VALUES(chapter),
      class_grade = VALUES(class_grade),
      file_url = VALUES(file_url),
      thumbnail_url = VALUES(thumbnail_url);
  `;

  const mutationOk = execSqlMutation(sql);
  if (!mutationOk) {
    console.error(`[saveLearningProgress] Failed to persist progress to MySQL for student ${studentId}, content ${contentId}`);
  }
  invalidateServerCache();

  return {
    id: `prog-${studentId}-${contentId}`,
    studentId: String(studentId),
    contentId,
    courseId: params.courseId || '',
    subject: params.subject || 'General',
    chapter: params.chapter || 'General',
    classGrade,
    title: params.title || 'Lesson Video',
    description: params.description || '',
    contentType,
    fileUrl: params.fileUrl || '',
    thumbnailUrl: params.thumbnailUrl || '',
    lastPositionSeconds: lastPos,
    durationSeconds: duration,
    progressPercent: progressPct,
    completed: Boolean(completed),
    lastWatchedAt,
    timeLeft: formatRemainingTime(duration, lastPos),
  };
}

function getRecentLearningProgress(studentId, limit = 5) {
  let rawId = studentId;
  if (isNaN(Number(rawId)) && typeof rawId === 'string' && rawId.includes('@')) {
    rawId = getUserIdByEmail(rawId) || rawId;
  }
  const numId = Number(rawId);
  if (!numId) return [];

  const query = `
    SELECT 
      id,
      student_id,
      content_id,
      course_id,
      subject,
      chapter,
      class_grade,
      title,
      description,
      content_type,
      file_url,
      thumbnail_url,
      last_position_seconds,
      duration_seconds,
      progress_percent,
      completed,
      last_watched_at
    FROM acadevia_content_db.student_learning_progress
    WHERE student_id = ${numId}
    ORDER BY last_watched_at DESC
    LIMIT ${Number(limit) || 5};
  `;

  const rows = execSql(query);
  return rows.map((r) => ({
    id: `prog-${r.id}`,
    studentId: String(r.student_id),
    contentId: String(r.content_id),
    courseId: r.course_id === 'NULL' ? '' : (r.course_id || ''),
    subject: r.subject,
    chapter: r.chapter,
    classGrade: Number(r.class_grade || 10),
    title: r.title,
    description: r.description || '',
    contentType: r.content_type || 'VIDEO',
    fileUrl: r.file_url || '',
    thumbnailUrl: r.thumbnail_url || '',
    lastPositionSeconds: Number(r.last_position_seconds || 0),
    durationSeconds: Number(r.duration_seconds || 0),
    progressPercent: Number(r.progress_percent || 0),
    completed: Boolean(Number(r.completed || 0)),
    lastWatchedAt: r.last_watched_at,
    timeLeft: formatRemainingTime(r.duration_seconds, r.last_position_seconds),
  }));
}

function getLearningProgressByContent(studentId, contentId) {
  let rawId = studentId;
  if (isNaN(Number(rawId)) && typeof rawId === 'string' && rawId.includes('@')) {
    rawId = getUserIdByEmail(rawId) || rawId;
  }
  const numId = Number(rawId);
  if (!numId || !contentId) return null;

  const query = `
    SELECT 
      id,
      student_id,
      content_id,
      course_id,
      subject,
      chapter,
      class_grade,
      title,
      description,
      content_type,
      file_url,
      thumbnail_url,
      last_position_seconds,
      duration_seconds,
      progress_percent,
      completed,
      last_watched_at
    FROM acadevia_content_db.student_learning_progress
    WHERE student_id = ${numId} AND content_id = '${String(contentId).replace(/'/g, "\\'")}'
    LIMIT 1;
  `;

  const rows = execSql(query);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: `prog-${r.id}`,
    studentId: String(r.student_id),
    contentId: String(r.content_id),
    courseId: r.course_id === 'NULL' ? '' : (r.course_id || ''),
    subject: r.subject,
    chapter: r.chapter,
    classGrade: Number(r.class_grade || 10),
    title: r.title,
    description: r.description || '',
    contentType: r.content_type || 'VIDEO',
    fileUrl: r.file_url || '',
    thumbnailUrl: r.thumbnail_url || '',
    lastPositionSeconds: Number(r.last_position_seconds || 0),
    durationSeconds: Number(r.duration_seconds || 0),
    progressPercent: Number(r.progress_percent || 0),
    completed: Boolean(Number(r.completed || 0)),
    lastWatchedAt: r.last_watched_at,
    timeLeft: formatRemainingTime(r.duration_seconds, r.last_position_seconds),
  };
}

// ---------------------------------------------------------------------------
// 9. NCERT Integration Methods
// ---------------------------------------------------------------------------
const ncertBridge = require('./ncertBridge.cjs');

function getNcertAvailableChapters({ classGrade = 9, subject = 'Mathematics' } = {}) {
  const chapters = ncertBridge.getIndexedChapters(classGrade, subject);
  return {
    classGrade: Number(classGrade),
    subject,
    chapters: chapters.map(c => ({
      id: c.chapterNumber,
      chapter: c.chapterNumber,
      name: c.title,
      sourceFile: c.sourceFile,
      chunkCount: c.chunkCount
    }))
  };
}

function generateNcertQuiz({
  studentId,
  classGrade = 9,
  subject = 'Mathematics',
  chapter = 'Coordinate Geometry',
  difficulty = 'medium',
  questionType = 'MCQ',
  count = 1
}) {
  if (Number(classGrade) !== 9) {
    throw new Error('Currently only NCERT Class 9 Mathematics dataset is indexed.');
  }

  const requestedCount = Math.min(Math.max(1, Number(count) || 1), 5);
  const questions = [];

  for (let i = 0; i < requestedCount; i++) {
    const q = ncertBridge.generateNcertQuestion({
      grade: classGrade,
      subject,
      topic: chapter,
      difficulty,
      bloomLevel: 'understand'
    });
    questions.push(q);
  }

  const newQuiz = createQuizInDb({
    teacherId: 10,
    teacherName: 'NCERT AI Tutor',
    classGrade: Number(classGrade),
    subject,
    chapter,
    chapterInfo: `${chapter} (NCERT Grounded)`,
    title: `NCERT Practice: ${chapter}`,
    description: `Personalized practice quiz grounded in NCERT Class ${classGrade} ${subject}.`,
    timeLimit: (questions.length * 60) || 300,
    difficulty: difficulty.toUpperCase(),
    xpReward: questions.length * 20,
    studentId,
    assignedStudentId: studentId ? String(studentId) : null,
    isAiGenerated: true,
    questions: questions.map((q, idx) => ({
      id: `q-ncert-${Date.now()}-${idx + 1}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      points: q.points || 10,
      topic: q.topic || chapter,
      source: q.source
    }))
  });

  return newQuiz;
}

module.exports = {
  getStateVersion,
  invalidateServerCache,
  execSql,
  execSqlMutation,
  resolveNumericQuizId,
  resolveAliasQuizId,
  getTeacherStudentsFromDb,
  getTeacherAnalyticsFromDb,
  getUsersFromDb,
  getQuizzesFromDb,
  getQuizByIdFromDb,
  getQuizAttemptsFromDb,
  submitAttemptToDb,
  createQuizInDb,
  deleteQuizFromDb,
  getContentItemsFromDb,
  createContentItemInDb,
  deleteContentItemFromDb,
  getFullDatabaseState,
  getLeaderboardFromDb,
  saveLearningProgress,
  getRecentLearningProgress,
  getLearningProgressByContent,
  getUserIdByEmail,
  getNcertAvailableChapters,
  generateNcertQuiz,
};

