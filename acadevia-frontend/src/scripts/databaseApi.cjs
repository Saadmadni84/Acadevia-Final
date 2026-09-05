const { execSync } = require('child_process');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Cloudflare R2 S3 Client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.STORAGE_ENDPOINT || 'https://c82b5cf783a510eb20c956cc368a0f7f.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'dc9bbee3c9bba2b9e94b6aec99625f63',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '2444f51c4d817af529368d1e40854a234839822712a07d3a0cdb4fd6079f324c',
  },
  forcePathStyle: true,
});

let presignedUrlCache = {};

async function getR2PresignedUrl(key = 'videos/10/1/1bf07910-3851-452f-b361-ee0bfe1760aa.mp4', bucket = 'acadevia-videos') {
  const cacheKey = `${bucket}:${key}`;
  const cached = presignedUrlCache[cacheKey];
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.url;
  }
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(r2Client, command, { expiresIn: 86400 });
    presignedUrlCache[cacheKey] = { url, expiresAt: Date.now() + 86400 * 1000 };
    return url;
  } catch (err) {
    console.error('Failed to generate R2 presigned URL:', err);
    return `https://c82b5cf783a510eb20c956cc368a0f7f.r2.cloudflarestorage.com/${bucket}/${key}`;
  }
}

function execSql(query) {
  try {
    let output;
    try {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot_password -B';
      output = execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8', timeout: 4000 });
    } catch {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot -B';
      output = execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8', timeout: 4000 });
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
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot_password';
      execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8', timeout: 4000 });
    } catch {
      const cmd = 'docker exec -i acadevia-mysql mysql -uroot -proot';
      execSync(cmd, { input: query, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8', timeout: 4000 });
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
    CREATE TABLE IF NOT EXISTS acadevia_content.content_items (
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

    CREATE TABLE IF NOT EXISTS acadevia_content.student_learning_progress (
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS acadevia_quiz_db.questions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      quiz_id BIGINT NOT NULL,
      question_text TEXT NOT NULL,
      option_a VARCHAR(255) NOT NULL,
      option_b VARCHAR(255) NOT NULL,
      option_c VARCHAR(255) NOT NULL,
      option_d VARCHAR(255) NOT NULL,
      correct_answer VARCHAR(10) NOT NULL,
      explanation TEXT,
      marks INT DEFAULT 10,
      topic VARCHAR(100) DEFAULT 'General',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
    try {
      const hasSection = execSql("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='acadevia_auth_db' AND TABLE_NAME='users' AND COLUMN_NAME='section'");
      if (hasSection.length === 0) {
        execSqlMutation("ALTER TABLE acadevia_auth_db.users ADD COLUMN section VARCHAR(10) DEFAULT 'A'");
      }
    } catch {
      // Ignore if column already exists
    }
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
  '109': 'quiz-c10-eng-2',
  '110': 'quiz-c10-hin-2',
  '111': 'quiz-c10-soc-2',
  '112': 'quiz-c10-cs-2',
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
// Standard Curriculum Questions fallback for quizzes 101-112
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
  107: [
    { id: 'q107_1', question: 'What is the discriminant of the quadratic equation x² + 5x + 6 = 0?', options: ['1', '25', '36', '11'], correctIndex: 0, explanation: 'D = b² - 4ac = 25 - 24 = 1.', points: 10, topic: 'Quadratic Equations' },
    { id: 'q107_2', question: 'Which method can be used to solve the equation x² - 9 = 0?', options: ['Factoring as difference of squares', 'Quadratic formula', 'Both A and B', 'None of these'], correctIndex: 2, explanation: 'Both factoring and quadratic formula yield x = ±3.', points: 10, topic: 'Quadratic Equations' },
    { id: 'q107_3', question: 'If the discriminant b² - 4ac < 0, then the quadratic equation has:', options: ['Two distinct real roots', 'Two equal real roots', 'No real roots', 'Infinite roots'], correctIndex: 2, explanation: 'A negative discriminant means no real solutions in real numbers.', points: 10, topic: 'Quadratic Equations' },
    { id: 'q107_4', question: 'What are the roots of the equation x² - 7x + 12 = 0?', options: ['3 and 4', '-3 and -4', '2 and 6', '1 and 12'], correctIndex: 0, explanation: '(x - 3)(x - 4) = 0 => x = 3, 4.', points: 10, topic: 'Quadratic Equations' },
    { id: 'q107_5', question: 'What is the nature of roots for 2x² - 4x + 3 = 0?', options: ['Real and equal', 'Real and distinct', 'No real roots', 'Rational and unequal'], correctIndex: 2, explanation: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8 (< 0), so no real roots exist.', points: 10, topic: 'Quadratic Equations' },
  ],
  108: [
    { id: 'q108_1', question: 'What is the value of sin²(θ) + cos²(θ) for any angle θ?', options: ['0', '1', '2', 'Depends on θ'], correctIndex: 1, explanation: 'sin²(θ) + cos²(θ) = 1 is the fundamental trigonometric identity.', points: 10, topic: 'Trigonometry' },
    { id: 'q108_2', question: 'If tan(θ) = 1 in a right triangle, what is the angle θ?', options: ['30°', '45°', '60°', '90°'], correctIndex: 1, explanation: 'tan(45°) = 1.', points: 10, topic: 'Trigonometry' },
    { id: 'q108_3', question: 'Which of the following is equal to sec²(θ) - 1?', options: ['tan²(θ)', 'cot²(θ)', 'sin²(θ)', 'cos²(θ)'], correctIndex: 0, explanation: '1 + tan²(θ) = sec²(θ), therefore sec²(θ) - 1 = tan²(θ).', points: 10, topic: 'Trigonometry' },
  ],
  109: [
    { id: 'q109_1', question: 'Who is the narrator of "A Triumph of Surgery"?', options: ['Mrs. Pumphrey', 'Mr. James Herriot', 'Tricki', 'Joe'], correctIndex: 1, explanation: 'Mr. James Herriot, a veterinary surgeon, is the author and narrator.', points: 10, topic: 'Literature' },
    { id: 'q109_2', question: 'Why was Tricki hospitalized for a fortnight?', options: ['Leg injury', 'Overfeeding and acute lethargy', 'Rabies vaccine', 'Dental surgery'], correctIndex: 1, explanation: 'Tricki was bloated like a sausage due to overfeeding by Mrs. Pumphrey.', points: 10, topic: 'Literature' },
    { id: 'q109_3', question: 'Which modal auxiliary expresses moral obligation or duty?', options: ['May', 'Ought to', 'Could', 'Might'], correctIndex: 1, explanation: '"Ought to" conveys moral duty or societal obligation.', points: 10, topic: 'Grammar' },
    { id: 'q109_4', question: 'In a formal letter to an editor, what is the standard salutation?', options: ['Hey Editor', 'Dear Sir/Madam', 'My Friend', 'Greetings all'], correctIndex: 1, explanation: '"Dear Sir/Madam" or "Sir/Madam" is the formal convention.', points: 10, topic: 'Writing Skills' },
    { id: 'q109_5', question: 'Identify the synonym of "dilapidated":', options: ['Brand new', 'Run-down', 'Gigantic', 'Modern'], correctIndex: 1, explanation: 'Dilapidated means falling apart or run-down.', points: 10, topic: 'Vocabulary' },
  ],
  110: [
    { id: 'q110_1', question: '‘हरिहर काका’ कहानी के लेखक कौन हैं?', options: ['मिथिलेश्वर', 'प्रेमचंद', 'महादेवी वर्मा', 'हरिवंश राय बच्चन'], correctIndex: 0, explanation: 'हरिहर काका कथाकार मिथिलेश्वर की प्रसिद्ध कहानी है।', points: 10, topic: 'संचयन' },
    { id: 'q110_2', question: '‘सूरज निकला और पक्षी चहचहाने लगे’ यह किस प्रकार का वाक्य है?', options: ['सरल वाक्य', 'संयुक्त वाक्य', 'मिश्र वाक्य', 'प्रश्नवाचक वाक्य'], correctIndex: 1, explanation: 'दो उपवाक्य ‘और’ योजक से जुड़े हैं, अतः यह संयुक्त वाक्य है।', points: 10, topic: 'वाक्य भेद' },
    { id: 'q110_3', question: '‘नौ दो ग्यारह होना’ मुहावरे का सही अर्थ क्या है?', options: ['गिनती सीखना', 'भाग जाना', 'मदद मांगना', 'वापस आना'], correctIndex: 1, explanation: 'नौ दो ग्यारह होना का अर्थ है तुरंत भाग जाना।', points: 10, topic: 'मुहावरे' },
    { id: 'q110_4', question: '‘अनुराग’ शब्द का सही विलोम शब्द क्या है?', options: ['विराग', 'राग', 'द्वेष', 'घृणा'], correctIndex: 0, explanation: 'अनुराग का विलोम विराग होता है।', points: 10, topic: 'विलोम' },
    { id: 'q110_5', question: '‘पीपर पात सरिस मन डोला’ में कौन-सा अलंकार है?', options: ['रूपक', 'उपमा', 'उत्प्रेक्षा', 'अनुप्रास'], correctIndex: 1, explanation: '‘सरिस’ वाचक शब्द के प्रयोग से उपमा अलंकार सिद्ध होता है।', points: 10, topic: 'अलंकार' },
  ],
  111: [
    { id: 'q111_1', question: 'Which soil is widely spread across the northern plains of India?', options: ['Black soil', 'Alluvial soil', 'Red soil', 'Arid soil'], correctIndex: 1, explanation: 'Alluvial soil deposited by Himalayan rivers covers northern plains.', points: 10, topic: 'Geography' },
    { id: 'q111_2', question: 'In which country did power-sharing resolve conflict between Dutch and French communities?', options: ['Sri Lanka', 'Belgium', 'Yugoslavia', 'Lebanon'], correctIndex: 1, explanation: 'Belgium amended its constitution to provide equal representation.', points: 10, topic: 'Civics' },
    { id: 'q111_3', question: 'Where was the first International Earth Summit held in 1992?', options: ['New York', 'Rio de Janeiro', 'Geneva', 'Kyoto'], correctIndex: 1, explanation: 'The 1992 Earth Summit was held in Rio de Janeiro, Brazil.', points: 10, topic: 'Economics' },
    { id: 'q111_4', question: 'Activities like dairy farming and agriculture belong to which economic sector?', options: ['Primary sector', 'Secondary sector', 'Tertiary sector', 'Quaternary sector'], correctIndex: 0, explanation: 'Direct extraction and harvesting of natural resources belongs to the primary sector.', points: 10, topic: 'Economics' },
    { id: 'q111_5', question: 'What is the primary objective of a federal system of government?', options: ['To concentrate power', 'To safeguard and promote unity while accommodating regional diversity', 'To eliminate state laws', 'To centralize all decisions'], correctIndex: 1, explanation: 'Federalism protects national unity while respecting regional diversity.', points: 10, topic: 'Civics' },
  ],
  112: [
    { id: 'q112_1', question: 'Which HTML attribute specifies the hyperlink target URL in an <a> tag?', options: ['src', 'href', 'link', 'target'], correctIndex: 1, explanation: 'The "href" attribute specifies the destination URL.', points: 10, topic: 'Web Basics' },
    { id: 'q112_2', question: 'Which secure protocol uses port 443 for encrypted web communication?', options: ['FTP', 'HTTPS', 'Telnet', 'SMTP'], correctIndex: 1, explanation: 'HTTPS encrypts HTTP traffic using TLS on port 443.', points: 10, topic: 'Networks' },
    { id: 'q112_3', question: 'A system that monitors and filters incoming and outgoing network traffic is called a:', options: ['Firewall', 'Modem', 'Compiler', 'Browser'], correctIndex: 0, explanation: 'A firewall establishes a barrier against unauthorized external network traffic.', points: 10, topic: 'Cybersecurity' },
    { id: 'q112_4', question: 'What does URL stand for in computer networking?', options: ['Uniform Resource Locator', 'Universal Record Link', 'Unified Router Logic', 'Unique Resource Line'], correctIndex: 0, explanation: 'URL stands for Uniform Resource Locator.', points: 10, topic: 'Networks' },
    { id: 'q112_5', question: 'Fraudulent attempts to steal passwords and sensitive data via fake websites is called:', options: ['Phishing', 'Compiling', 'Defragmenting', 'Formatting'], correctIndex: 0, explanation: 'Phishing involves deceptive emails and spoofed sites to trick users.', points: 10, topic: 'Cyber Ethics' },
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
      COALESCE(u.section, 'A') as section,
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
    WHERE u.class_grade = ${classGrade} AND u.role = 'STUDENT' AND u.is_active = 1
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.class_grade, u.section, u.student_school_id, u.avatar_url, u.total_xp, u.current_level, u.current_streak
    ORDER BY totalXP DESC, u.id ASC;
  `;

  const attemptsQuery = `
    SELECT 
      a.id, 
      a.quiz_id as quizId, 
      a.user_id as studentId, 
      CONCAT(u.first_name, ' ', u.last_name) as studentName,
      q.title as quizTitle,
      q.subject,
      u.class_grade as classGrade,
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
    WHERE u.class_grade = ${classGrade} AND u.role = 'STUDENT'
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
      className: `Class ${st.classGrade || classGrade}`,
      section: st.section || 'A',
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
      activities: studentAttempts
        .slice(-10)
        .reverse()
        .map((att) => ({
          id: `act-att-${att.id}`,
          type: 'QUIZ_COMPLETED',
          title: `Completed Quiz: ${att.quizTitle}`,
          description: `Scored ${att.percentage}% (${att.score}/${att.maxScore} pts) • ${att.subject}`,
          timestamp: att.completedAt || 'Recently',
          badgeText: `${att.percentage}% Score`,
        })),
    };
  });

  serverCache.teacherStudents.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

// ---------------------------------------------------------------------------
// 1.5 Get Comprehensive Student Academic Profile
// ---------------------------------------------------------------------------
function getStudentProfileFromDb(studentId) {
  const numId = Number(studentId);
  if (!numId || isNaN(numId)) return null;

  const userQuery = `
    SELECT 
      u.id,
      u.first_name as firstName,
      u.last_name as lastName,
      u.email,
      u.role,
      u.class_grade as classGrade,
      COALESCE(u.section, 'A') as section,
      u.student_school_id as studentSchoolId,
      u.avatar_url as avatarUrl,
      u.total_xp as totalXP,
      u.current_level as level,
      u.current_streak as streak,
      u.longest_streak as longestStreak,
      u.board,
      u.preferred_language as language,
      u.phone,
      u.created_at as createdAt
    FROM acadevia_auth_db.users u
    WHERE u.id = ${numId} AND u.is_active = 1
    LIMIT 1;
  `;
  const users = execSql(userQuery);
  if (users.length === 0) return null;
  const u = users[0];

  const attemptsQuery = `
    SELECT 
      a.id,
      a.quiz_id as quizId,
      q.title as quizTitle,
      q.subject,
      a.score,
      a.total_marks as maxScore,
      a.percentage,
      a.is_passed as passed,
      a.total_questions as totalQuestions,
      a.correct_answers as correctAnswers,
      a.wrong_answers as wrongAnswers,
      a.time_taken_seconds as timeTakenSeconds,
      a.xp_earned as xpEarned,
      a.completed_at as completedAt
    FROM acadevia_quiz_db.quiz_attempts a
    JOIN acadevia_quiz_db.quizzes q ON a.quiz_id = q.id
    WHERE a.user_id = ${numId}
    ORDER BY a.completed_at DESC, a.id DESC;
  `;
  const attempts = execSql(attemptsQuery);

  const quizzesCompleted = attempts.length;
  const totalQuestionsSum = attempts.reduce((sum, a) => sum + (Number(a.totalQuestions) || 0), 0);
  const correctAnswersSum = attempts.reduce((sum, a) => sum + (Number(a.correctAnswers) || 0), 0);
  const accuracy = totalQuestionsSum > 0 ? Math.round((correctAnswersSum / totalQuestionsSum) * 100) : 0;
  const avgScore = quizzesCompleted > 0 ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / quizzesCompleted) : 0;
  const bestScore = quizzesCompleted > 0 ? Math.max(...attempts.map((a) => Number(a.percentage) || 0)) : 0;
  const totalStudyMinutes = attempts.reduce((sum, a) => sum + Math.max(1, Math.round((Number(a.timeTakenSeconds) || 180) / 60)), 0);

  // Subject Performance Breakdown
  const subjectMap = {};
  attempts.forEach((a) => {
    const sub = a.subject || 'General';
    if (!subjectMap[sub]) {
      subjectMap[sub] = { subject: sub, totalScore: 0, count: 0, totalQuestions: 0, correctAnswers: 0 };
    }
    subjectMap[sub].totalScore += Number(a.percentage) || 0;
    subjectMap[sub].count++;
    subjectMap[sub].totalQuestions += Number(a.totalQuestions) || 0;
    subjectMap[sub].correctAnswers += Number(a.correctAnswers) || 0;
  });

  const subjectPerformance = Object.values(subjectMap).map((sm) => ({
    subject: sm.subject,
    score: Math.round(sm.totalScore / sm.count),
    quizzesTaken: sm.count,
    accuracy: sm.totalQuestions > 0 ? Math.round((sm.correctAnswers / sm.totalQuestions) * 100) : 0,
  }));

  // Recent Student Activities (Quiz submissions + learning progress)
  const learningProgress = execSql(`
    SELECT title, subject, chapter, progress_percent as progressPercent, completed, last_watched_at as lastWatchedAt
    FROM acadevia_content_db.student_learning_progress
    WHERE student_id = ${numId}
    ORDER BY last_watched_at DESC LIMIT 5;
  `);

  const activities = [];
  attempts.slice(0, 10).forEach((att) => {
    activities.push({
      id: `act-q-${att.id}`,
      type: 'QUIZ_COMPLETED',
      title: `Completed Quiz: ${att.quizTitle}`,
      description: `Scored ${att.percentage}% (${att.score}/${att.maxScore} pts) • ${att.subject}`,
      timestamp: att.completedAt || 'Recently',
      badgeText: `${att.percentage}% Score`,
      date: att.completedAt,
    });
  });

  learningProgress.forEach((lp, idx) => {
    activities.push({
      id: `act-lp-${idx}`,
      type: 'LESSON_COMPLETED',
      title: `${lp.completed === '1' ? 'Completed' : 'Watched'} Lesson: ${lp.title}`,
      description: `${lp.subject} • ${lp.chapter} (${Math.round(lp.progressPercent)}% watched)`,
      timestamp: lp.lastWatchedAt || 'Recently',
      badgeText: `${Math.round(lp.progressPercent)}% Video`,
      date: lp.lastWatchedAt,
    });
  });

  activities.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // Badges calculation
  const totalXP = Number(u.totalXP) || 0;
  const level = Number(u.level) || 1;
  const streak = Number(u.streak) || 0;
  const longestStreak = Number(u.longestStreak) || streak;

  const badges = [
    { id: 'b1', name: 'First Lesson', description: 'Complete your first lesson or quiz', icon: '📖', isEarned: quizzesCompleted >= 1 },
    { id: 'b2', name: 'Quiz Master', description: 'Score 80%+ on 10 quizzes', icon: '🧠', isEarned: quizzesCompleted >= 10 && avgScore >= 80 },
    { id: 'b3', name: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: '🔥', isEarned: longestStreak >= 7 },
    { id: 'b4', name: 'Scholar', description: 'Reach Level 10 on Acadevia', icon: '🎓', isEarned: level >= 10 },
    { id: 'b6', name: 'Perfect Score', description: 'Score 100% on 5 quizzes', icon: '💯', isEarned: attempts.filter((a) => Number(a.percentage) === 100).length >= 5 },
    { id: 'b7', name: 'Legend', description: 'Reach Level 50 on Acadevia', icon: '⭐', isEarned: level >= 50 },
  ];

  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  const avatar = (u.avatarUrl && u.avatarUrl !== 'NULL' && u.avatarUrl !== 'null')
    ? u.avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

  return {
    id: String(u.id),
    name: fullName,
    fullName,
    email: u.email,
    role: u.role,
    avatar,
    avatarUrl: avatar,
    classGrade: Number(u.classGrade || 10),
    className: `Class ${u.classGrade || 10}`,
    section: u.section || 'A',
    schoolName: 'Acadevia Demo School',
    enrollmentStatus: 'Enrolled',
    studentSchoolId: u.studentSchoolId || `STU-${u.id}`,
    board: u.board || 'CBSE',
    language: u.language || 'English',
    phone: u.phone || '+91 98765 43210',
    totalXP,
    level,
    streak,
    longestStreak,
    quizzesCompleted,
    avgScore,
    accuracy,
    bestScore,
    progress: Math.min(100, Math.round((quizzesCompleted / 12) * 100)),
    curriculumCompletion: Math.min(100, Math.round((quizzesCompleted / 12) * 100)),
    studyMinutes: totalStudyMinutes,
    results: attempts.map((att) => ({
      id: `att-${att.id}`,
      quizId: resolveAliasQuizId(att.quizId),
      numericQuizId: String(att.quizId),
      quizTitle: att.quizTitle,
      subject: att.subject,
      studentId: String(numId),
      studentName: fullName,
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
    subjectPerformance,
    activities: activities.slice(0, 10),
    badges,
  };
}

// ---------------------------------------------------------------------------
// 2. Get Teacher Analytics
// ---------------------------------------------------------------------------
// 2.5 Teacher Analytics Query with Date Range, Subject & Class Isolation
// ---------------------------------------------------------------------------
function getTeacherAnalyticsFromDb(classGrade = 10, subject = 'All', dateRange = '30') {
  const normDateRange = String(dateRange || '30').toLowerCase();
  const cacheKey = `${classGrade}_${subject}_${normDateRange}`;
  const cached = serverCache.teacherAnalytics.get(cacheKey);
  if (isFresh(cached)) {
    return cached.data;
  }
  const students = getTeacherStudentsFromDb(classGrade);
  const totalStudents = students.length;

  const allClassAttempts = students.flatMap((s) => s.results);

  // Subject filtering: support CBSE grouping for Science (Physics, Chemistry, Biology)
  const normSubject = (subject || 'All').trim();
  const subjectFilter = (att) => {
    if (!normSubject || normSubject === 'All') return true;
    const attSub = (att.subject || '').toLowerCase();
    const selSub = normSubject.toLowerCase();
    if (selSub === 'science') {
      return attSub === 'science' || attSub === 'physics' || attSub === 'chemistry' || attSub === 'biology';
    }
    return attSub === selSub;
  };

  // Date filtering
  const now = Date.now();
  let cutoffTime = 0;
  if (normDateRange === '7') {
    cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
  } else if (normDateRange === '30') {
    cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
  } else if (normDateRange === '90') {
    cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
  }

  const filteredAttempts = allClassAttempts.filter((att) => {
    if (!subjectFilter(att)) return false;
    if (cutoffTime > 0) {
      const attTime = att.completedAt ? new Date(att.completedAt).getTime() : 0;
      if (attTime < cutoffTime) return false;
    }
    return true;
  });

  const totalSubmissions = filteredAttempts.length;
  const classAverage = totalSubmissions > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalSubmissions)
    : 0;

  // Active students in reporting period
  const submittedStudentIds = new Set(filteredAttempts.map((att) => String(att.studentId)));
  const activeStudents = submittedStudentIds.size;
  const completionRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const notStartedCount = Math.max(0, totalStudents - activeStudents);
  const notStartedPct = Math.max(0, 100 - completionRate);

  const completionData = [
    { name: 'Completed', value: completionRate, count: activeStudents, color: '#5B2C6F' },
    { name: 'In Progress', value: 0, count: 0, color: '#f59e0b' },
    { name: 'Not Started', value: notStartedPct, count: notStartedCount, color: '#ef4444' },
  ];

  // 1. Quizzes summary (filtered by class, subject, date)
  const allQuizzes = getQuizzesFromDb();
  const classQuizzes = allQuizzes.filter((q) => {
    if (Number(q.classGrade) !== Number(classGrade)) return false;
    if (normSubject !== 'All') {
      const qSub = (q.subject || '').toLowerCase();
      const selSub = normSubject.toLowerCase();
      if (selSub === 'science') {
        return qSub === 'science' || qSub === 'physics' || qSub === 'chemistry' || qSub === 'biology';
      }
      return qSub === selSub;
    }
    return true;
  });

  const detailedQuizzes = classQuizzes.map((q) => {
    const qAttempts = filteredAttempts.filter((att) => String(att.quizId) === String(q.id) || String(att.quizId) === String(q.numericId));
    const count = qAttempts.length;
    const avg = count > 0 ? Math.round(qAttempts.reduce((sum, a) => sum + a.percentage, 0) / count) : 0;
    const distinctAttempters = new Set(qAttempts.map((a) => String(a.studentId))).size;
    const compPct = totalStudents > 0 ? Math.round((distinctAttempters / totalStudents) * 100) : 0;
    const status = avg >= 75 ? 'STRONG' : avg >= 50 ? 'SATISFACTORY' : (count > 0 ? 'NEEDS_ATTENTION' : 'NO_DATA');
    return {
      id: q.id,
      title: q.title,
      name: q.title.length > 22 ? q.title.substring(0, 20) + '...' : q.title,
      fullName: q.title,
      subject: q.subject,
      chapterInfo: q.chapterInfo || '',
      avg,
      avgScore: avg,
      attempts: count,
      completionPct: compPct,
      status,
    };
  });

  // Fallback for quizScores
  const quizScores = detailedQuizzes.map((q) => ({
    id: q.id,
    name: q.name,
    fullName: q.fullName,
    avg: q.avg,
    attempts: q.attempts,
  }));

  // 2. Engagement & Performance Trend (Timeline)
  const numDays = normDateRange === '7' ? 7 : normDateRange === '90' ? 90 : 30;
  const engagementTrend = [];
  const nowDate = new Date();

  let runningClassAvg = classAverage;
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(nowDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayAttempts = filteredAttempts.filter((att) => (att.completedAt || '').startsWith(dateStr));
    const daySubmissions = dayAttempts.length;
    if (daySubmissions > 0) {
      runningClassAvg = Math.round(dayAttempts.reduce((sum, a) => sum + a.percentage, 0) / daySubmissions);
    }
    engagementTrend.push({
      day: dayLabel,
      date: dateStr,
      engagement: daySubmissions,
      submissions: daySubmissions,
      score: daySubmissions > 0 ? runningClassAvg : (classAverage > 0 ? classAverage : 0),
    });
  }

  // 3. Full Student Roster (All students in class, with real filtered stats)
  const studentRoster = students.map((st) => {
    const stAttempts = filteredAttempts.filter((a) => String(a.studentId) === String(st.id));
    const quizzesCompleted = stAttempts.length;
    const avgScore = quizzesCompleted > 0
      ? Math.round(stAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizzesCompleted)
      : 0;
    const status = quizzesCompleted === 0
      ? 'NOT_STARTED'
      : avgScore >= 80
      ? 'EXCELLING'
      : avgScore >= 50
      ? 'ON_TRACK'
      : 'NEEDS_ATTENTION';
    const needsAttentionReason = avgScore < 50 && quizzesCompleted > 0
      ? `Average score is ${avgScore}% (below 50% passing threshold)`
      : undefined;

    return {
      id: String(st.id),
      name: st.name,
      avatarUrl: st.avatarUrl,
      className: st.className || `Class ${classGrade}`,
      section: st.section || 'A',
      avgScore,
      quizzesCompleted,
      totalXP: st.totalXP,
      streak: st.streak,
      status,
      needsAttentionReason,
    };
  });

  // Top performers & at-risk
  const assessedStudents = studentRoster.filter((s) => s.quizzesCompleted > 0);
  const topPerformers = [...assessedStudents]
    .sort((a, b) => b.avgScore - a.avgScore || b.totalXP - a.totalXP)
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      name: s.name,
      score: s.avgScore,
      xp: s.totalXP,
      quizzesTaken: s.quizzesCompleted,
    }));

  const atRiskStudents = assessedStudents
    .filter((s) => s.avgScore < 50)
    .map((s) => ({
      id: s.id,
      name: s.name,
      score: s.avgScore,
      lastActive: 'Recently',
    }));

  // 4. Subject Comparison across curriculum subjects
  const classSubjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  const subjectComparison = [
    { name: 'Mathematics', match: (s) => s === 'mathematics' || s === 'math' },
    { name: 'Science', match: (s) => s === 'science' || s === 'physics' || s === 'chemistry' || s === 'biology' },
    { name: 'Social Science', match: (s) => s === 'social science' || s === 'social' || s === 'history' || s === 'civics' },
    { name: 'English', match: (s) => s === 'english' },
    { name: 'Hindi', match: (s) => s === 'hindi' },
    { name: 'Computer Science', match: (s) => s === 'computer science' || s === 'cs' },
  ].map((subItem) => {
    const subAttempts = allClassAttempts.filter((att) => {
      const attSub = (att.subject || '').toLowerCase();
      if (!subItem.match(attSub)) return false;
      if (cutoffTime > 0) {
        const attTime = att.completedAt ? new Date(att.completedAt).getTime() : 0;
        if (attTime < cutoffTime) return false;
      }
      return true;
    });
    const count = subAttempts.length;
    const score = count > 0 ? Math.round(subAttempts.reduce((sum, a) => sum + a.percentage, 0) / count) : 0;
    return {
      subject: subItem.name === 'Social Science' ? 'Social' : subItem.name,
      score,
      submissions: count,
    };
  });

  // 5. Actionable Insights from real data
  const actionableInsights = [];
  if (atRiskStudents.length > 0) {
    actionableInsights.push({
      id: 'ins-atrisk',
      type: 'CRITICAL',
      title: 'Academic Support Recommended',
      description: `${atRiskStudents.length} student${atRiskStudents.length > 1 ? 's are' : ' is'} averaging below the 50% passing threshold in active assessments.`,
      metric: `${atRiskStudents.length} Students`,
      actionLabel: 'View Flagged Students',
      actionType: 'VIEW_STUDENTS',
    });
  }

  const activeSubjectComparisons = subjectComparison.filter((s) => s.submissions > 0);
  if (activeSubjectComparisons.length > 0) {
    const weakestSubject = [...activeSubjectComparisons].sort((a, b) => a.score - b.score)[0];
    if (weakestSubject && weakestSubject.score < 70) {
      actionableInsights.push({
        id: 'ins-weak-sub',
        type: 'WARNING',
        title: 'Curriculum Focus Area',
        description: `${weakestSubject.subject} has the lowest average mastery score (${weakestSubject.score}%) across ${weakestSubject.submissions} submission(s).`,
        metric: `${weakestSubject.score}% Avg`,
        actionLabel: 'Filter by Subject',
        actionType: 'VIEW_SUBJECT',
      });
    }
  }

  if (classAverage >= 60 && totalSubmissions > 0) {
    actionableInsights.push({
      id: 'ins-progress',
      type: 'POSITIVE',
      title: 'Strong Overall Mastery',
      description: `Class average is ${classAverage}% across ${totalSubmissions} graded submission(s) in this period.`,
      metric: `${classAverage}%`,
    });
  }

  if (completionRate === 100 && totalStudents > 0) {
    actionableInsights.push({
      id: 'ins-completion',
      type: 'POSITIVE',
      title: 'Full Class Participation',
      description: `All ${totalStudents} enrolled students in Class ${classGrade} have submitted assessments.`,
      metric: '100% Active',
    });
  } else if (totalStudents > 0 && activeStudents < totalStudents) {
    const inactiveCount = totalStudents - activeStudents;
    actionableInsights.push({
      id: 'ins-participation',
      type: 'NEUTRAL',
      title: 'Participation Opportunity',
      description: `${inactiveCount} enrolled student${inactiveCount > 1 ? 's have' : ' has'} not yet submitted assessments in this reporting period.`,
      metric: `${completionRate}% Active`,
      actionLabel: 'View Inactive Students',
      actionType: 'VIEW_INACTIVE',
    });
  }

  const result = {
    classGrade: Number(classGrade),
    availableClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    subject: normSubject,
    availableSubjects: ['All', ...classSubjects],
    dateRange: normDateRange,
    totalStudents,
    activeStudents,
    totalSubmissions,
    classAverage,
    completionRate,
    quizScores,
    detailedQuizzes,
    completionData,
    engagementTrend,
    studentRoster,
    topPerformers,
    atRiskStudents,
    subjectComparison,
    actionableInsights,
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
      CONCAT(u.first_name, ' ', u.last_name) as teacherName,
      q.created_at as createdAt,
      COALESCE(q.topic, q.chapter_info, '') as chapterInfo
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
    const ans = String(q.correctAnswer || '').trim();
    const upperAns = ans.toUpperCase();
    const foundIdx = options.findIndex((opt) => String(opt).trim().toLowerCase() === ans.toLowerCase());
    if (foundIdx !== -1) {
      correctIndex = foundIdx;
    } else if (upperAns === 'B' || upperAns === '1') {
      correctIndex = 1;
    } else if (upperAns === 'C' || upperAns === '2') {
      correctIndex = 2;
    } else if (upperAns === 'D' || upperAns === '3') {
      correctIndex = 3;
    } else {
      correctIndex = 0;
    }

    questionMap[qId].push({
      id: `q-${q.id}`,
      questionId: Number(q.id),
      numericId: Number(q.id),
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
      teacherName: (q.teacherName || 'Faculty').trim(),
      classGrade: Number(q.classGrade) || 10,
      subject: q.subject,
      chapter: q.chapterInfo || '',
      chapterInfo: q.chapterInfo || '',
      title: q.title,
      description: q.description || '',
      timeLimit: (Number(q.timeLimitMinutes) || 5) * 60,
      difficulty: (q.difficulty || 'medium').toLowerCase(),
      xpReward: Number(q.xpReward) || 50,
      createdAt: q.createdAt || new Date().toISOString(),
      questions,
    };
  });
  serverCache.quizzes = { data: result, timestamp: Date.now() };
  return result;
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
// 5.8 Initialize Question Mastery Table and Backfill Existing Attempts
// ---------------------------------------------------------------------------
function initQuestionMasteryTable() {
  try {
    execSqlMutation(`
      CREATE TABLE IF NOT EXISTS acadevia_quiz_db.student_question_mastery (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        quiz_id BIGINT NOT NULL,
        question_id BIGINT NOT NULL,
        xp_awarded INT NOT NULL DEFAULT 0,
        mastered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attempt_id BIGINT,
        UNIQUE KEY uniq_user_question (user_id, question_id),
        KEY idx_user_quiz (user_id, quiz_id)
      );
    `);

    // Check if backfill is needed
    const countRows = execSql(`SELECT COUNT(*) as cnt FROM acadevia_quiz_db.student_question_mastery;`);
    const currentCount = Number(countRows[0]?.cnt || 0);

    if (currentCount === 0) {
      const attempts = execSql(`SELECT id, quiz_id, user_id, answers_json, completed_at FROM acadevia_quiz_db.quiz_attempts ORDER BY id ASC;`);
      const questions = execSql(`SELECT id, quiz_id, marks, optiona, optionb, optionc, optiond, correct_answer FROM acadevia_quiz_db.questions WHERE is_active = 1 ORDER BY id ASC;`);

      const questionsByQuiz = {};
      questions.forEach((q) => {
        const qzId = String(q.quiz_id);
        if (!questionsByQuiz[qzId]) questionsByQuiz[qzId] = [];
        const options = [q.optiona, q.optionb, q.optionc, q.optiond].filter(Boolean);
        let correctIndex = 0;
        const ans = String(q.correct_answer || '').trim();
        const upperAns = ans.toUpperCase();
        const foundIdx = options.findIndex((opt) => String(opt).trim().toLowerCase() === ans.toLowerCase());
        if (foundIdx !== -1) {
          correctIndex = foundIdx;
        } else if (upperAns === 'B' || upperAns === '1') {
          correctIndex = 1;
        } else if (upperAns === 'C' || upperAns === '2') {
          correctIndex = 2;
        } else if (upperAns === 'D' || upperAns === '3') {
          correctIndex = 3;
        } else {
          correctIndex = 0;
        }
        questionsByQuiz[qzId].push({
          id: Number(q.id),
          correctIndex,
          points: Number(q.marks) || 10,
        });
      });

      const masteredSet = new Set();
      attempts.forEach((att) => {
        let answers = [];
        try {
          answers = JSON.parse(att.answers_json || '[]');
        } catch {}
        const qList = questionsByQuiz[String(att.quiz_id)] || [];
        qList.forEach((q, idx) => {
          let studentAns = Array.isArray(answers) ? answers[idx] : undefined;
          if (studentAns !== undefined && Number(studentAns) === Number(q.correctIndex)) {
            const key = `${att.user_id}_${q.id}`;
            if (!masteredSet.has(key)) {
              masteredSet.add(key);
              const xp = (Number(q.points) || 1) * 10;
              const completedTime = att.completed_at || new Date().toISOString().slice(0, 19).replace('T', ' ');
              try {
                execSqlMutation(`
                  INSERT IGNORE INTO acadevia_quiz_db.student_question_mastery
                  (user_id, quiz_id, question_id, xp_awarded, mastered_at, attempt_id)
                  VALUES
                  (${att.user_id}, ${att.quiz_id}, ${q.id}, ${xp}, '${completedTime}', ${att.id});
                `);
              } catch {}
            }
          }
        });
      });
    }
  } catch (err) {
    console.warn('[initQuestionMasteryTable] error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// 6. Submit Quiz Attempt to Database & Update Student XP / Streaks
// ---------------------------------------------------------------------------
function submitAttemptToDb(params) {
  initQuestionMasteryTable();
  const numericQuizId = resolveNumericQuizId(params.quizId);
  const studentId = Number(params.studentId);
  if (!studentId || isNaN(studentId)) {
    throw new Error('Valid studentId is required to submit an attempt');
  }

  const rawAnswers = params.answers;
  let answers = [];
  if (Array.isArray(rawAnswers)) {
    answers = rawAnswers;
  } else if (rawAnswers && typeof rawAnswers === 'object') {
    answers = rawAnswers;
  }

  const timeTakenSeconds = Number(params.timeTakenSeconds) || 180;
  const completedAt = params.completedAt || new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Fetch previous attempts for this student & quiz to determine attempt number
  const previousAttempts = execSql(`
    SELECT id, attempt_number, score, total_marks, percentage, is_passed, xp_earned, completed_at 
    FROM acadevia_quiz_db.quiz_attempts 
    WHERE quiz_id = ${numericQuizId} AND user_id = ${studentId} 
    ORDER BY id ASC;
  `);
  const attemptNumber = previousAttempts.length + 1;
  const isRetest = attemptNumber > 1;

  // Fetch quiz to calculate score and question points
  const quizzes = getQuizzesFromDb();
  const quiz = quizzes.find((q) => q.numericId === String(numericQuizId) || q.id === params.quizId);

  // Retrieve already mastered question IDs for this student for this quiz
  const masteredRows = execSql(`
    SELECT question_id 
    FROM acadevia_quiz_db.student_question_mastery 
    WHERE user_id = ${studentId} AND quiz_id = ${numericQuizId};
  `);
  const masteredQuestionIds = new Set(masteredRows.map((r) => Number(r.question_id)));

  let score = 0;
  let totalMarks = quiz?.questions?.reduce((acc, q) => acc + q.points, 0) || 50;
  let correctCount = 0;
  let wrongCount = 0;
  let attemptXpEarned = 0;
  let newlyMasteredCount = 0;
  const newlyMasteredQuestions = [];

  if (quiz && quiz.questions && quiz.questions.length > 0) {
    quiz.questions.forEach((q, idx) => {
      let studentAns = Array.isArray(answers) ? answers[idx] : undefined;
      if (studentAns === undefined && typeof answers === 'object') {
        studentAns = answers[q.id] !== undefined ? answers[q.id] : answers[String(idx)];
      }

      const qNumId = Number(q.numericId || String(q.id).replace(/\D/g, '')) || (idx + 1);
      const isCorrect = studentAns !== undefined && Number(studentAns) === Number(q.correctIndex);

      if (isCorrect) {
        score += q.points;
        correctCount++;

        // Check if question was ever mastered before
        if (!masteredQuestionIds.has(qNumId)) {
          // Newly mastered! Award normal XP
          const qXp = (Number(q.points) || 1) * 10;
          attemptXpEarned += qXp;
          newlyMasteredCount++;
          newlyMasteredQuestions.push({ questionId: qNumId, xp: qXp });
          masteredQuestionIds.add(qNumId);
        } else {
          // Already mastered in an earlier attempt: 0 additional XP
        }
      } else {
        wrongCount++;
      }
    });
  } else {
    score = 40;
    totalMarks = 50;
    correctCount = 4;
    wrongCount = 1;
    attemptXpEarned = isRetest ? 0 : 400;
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const isPassed = percentage >= 60 ? 1 : 0;
  const answersJson = JSON.stringify(answers).replace(/'/g, "\\'");
  const totalQuestions = quiz?.questions?.length || (Array.isArray(answers) ? answers.length : Object.keys(answers).length) || 5;

  const insertSql = `
    INSERT INTO acadevia_quiz_db.quiz_attempts
    (quiz_id, user_id, status, attempt_number, score, total_marks, percentage, is_passed, total_questions, correct_answers, wrong_answers, time_taken_seconds, xp_earned, answers_json, completed_at)
    VALUES
    (${numericQuizId}, ${studentId}, 'SUBMITTED', ${attemptNumber}, ${score}, ${totalMarks}, ${percentage}, ${isPassed}, ${totalQuestions}, ${correctCount}, ${wrongCount}, ${timeTakenSeconds}, ${attemptXpEarned}, '${answersJson}', '${completedAt}');
  `;
  execSqlMutation(insertSql);

  const attemptIdRow = execSql(`SELECT MAX(id) as maxId FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${studentId} AND quiz_id = ${numericQuizId};`);
  const attemptId = Number(attemptIdRow[0]?.maxId) || 0;

  // Persist newly mastered questions to student_question_mastery
  newlyMasteredQuestions.forEach((nm) => {
    try {
      execSqlMutation(`
        INSERT IGNORE INTO acadevia_quiz_db.student_question_mastery
        (user_id, quiz_id, question_id, xp_awarded, mastered_at, attempt_id)
        VALUES
        (${studentId}, ${numericQuizId}, ${nm.questionId}, ${nm.xp}, '${completedAt}', ${attemptId});
      `);
    } catch {}
  });

  // Record individual answers into attempt_answers
  if (quiz && quiz.questions && quiz.questions.length > 0) {
    quiz.questions.forEach((q, idx) => {
      let studentAns = Array.isArray(answers) ? answers[idx] : undefined;
      if (studentAns === undefined && typeof answers === 'object') {
        studentAns = answers[q.id] !== undefined ? answers[q.id] : answers[String(idx)];
      }
      const qNumId = Number(q.numericId || String(q.id).replace(/\D/g, '')) || (idx + 1);
      const isCorrect = studentAns !== undefined && Number(studentAns) === Number(q.correctIndex);
      try {
        execSqlMutation(`
          INSERT INTO acadevia_quiz_db.attempt_answers
          (attempt_id, question_id, quiz_id, user_id, selected_answer, is_correct, marks_awarded, time_taken_seconds)
          VALUES
          (${attemptId}, ${qNumId}, ${numericQuizId}, ${studentId}, '${studentAns !== undefined ? String(studentAns) : ''}', ${isCorrect ? 1 : 0}, ${isCorrect ? q.points : 0}, 0);
        `);
      } catch {}
    });
  }

  // Authoritatively update student total_xp and current_level in acadevia_auth_db.users from actual attempts sum
  const updateStudentSql = `
    UPDATE acadevia_auth_db.users
    SET 
      total_xp = (SELECT COALESCE(SUM(xp_earned), 0) FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${studentId}),
      current_level = FLOOR((SELECT COALESCE(SUM(xp_earned), 0) FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${studentId}) / 500) + 1,
      current_streak = GREATEST(current_streak, 1),
      longest_streak = GREATEST(longest_streak, current_streak, 1)
    WHERE id = ${studentId};
  `;
  execSqlMutation(updateStudentSql);
  invalidateServerCache();

  // Fetch updated total XP and student name
  const updatedUser = execSql(`SELECT first_name, last_name, total_xp, current_level FROM acadevia_auth_db.users WHERE id = ${studentId};`);
  const studentName = updatedUser[0] ? `${updatedUser[0].first_name || ''} ${updatedUser[0].last_name || ''}`.trim() : 'Student';
  const updatedTotalXP = Number(updatedUser[0]?.total_xp) || 0;
  const updatedLevel = Number(updatedUser[0]?.current_level) || 1;

  return {
    id: `res-${attemptId}`,
    attemptId: Number(attemptId),
    quizId: resolveAliasQuizId(numericQuizId),
    numericQuizId: String(numericQuizId),
    quizTitle: quiz?.title || 'Class Assessment',
    studentId: String(studentId),
    studentName,
    teacherId: quiz?.teacherId || '10',
    classGrade: quiz?.classGrade || 10,
    subject: quiz?.subject || 'Mathematics',
    score,
    totalPoints: totalMarks,
    percentage,
    totalQuestions,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    isPassed,
    answers,
    completedAt,
    attemptNumber,
    isRetest,
    newMasteredCount: newlyMasteredCount,
    xpEarned: attemptXpEarned,
    totalStudentXP: updatedTotalXP,
    level: updatedLevel,
    timeTakenSeconds,
  };
}

// ---------------------------------------------------------------------------
// 6.5 Get Subject Mastery Detail & Student Drill-Down for Teacher Analytics
// ---------------------------------------------------------------------------
function getSubjectMasteryDetailFromDb(classGrade = 10, subjectName = 'Mathematics') {
  initQuestionMasteryTable();
  const students = getTeacherStudentsFromDb(classGrade);
  const totalEnrolledStudents = students.length;

  const normSubject = (subjectName || 'Mathematics').trim().toLowerCase();
  const matchSubject = (sub) => {
    const s = (sub || '').toLowerCase();
    if (normSubject === 'all') return true;
    if (normSubject === 'mathematics' || normSubject === 'math') {
      return s === 'mathematics' || s === 'math';
    }
    if (normSubject === 'science') {
      return s === 'science' || s === 'physics' || s === 'chemistry' || s === 'biology';
    }
    if (normSubject === 'social' || normSubject === 'social science') {
      return s === 'social science' || s === 'social' || s === 'history' || s === 'civics';
    }
    if (normSubject === 'english') return s === 'english';
    if (normSubject === 'hindi') return s === 'hindi';
    if (normSubject === 'computer science' || normSubject === 'cs') {
      return s === 'computer science' || s === 'cs';
    }
    return s === normSubject;
  };

  // Extract all attempts across students for this subject
  const allAttempts = [];
  students.forEach((st) => {
    (st.results || []).forEach((res) => {
      if (matchSubject(res.subject)) {
        allAttempts.push({
          ...res,
          studentId: String(st.id),
          studentName: st.name,
          studentAvatar: st.avatar,
          className: st.className,
          section: st.section,
        });
      }
    });
  });

  // Group attempts by student and quiz
  const studentQuizMap = new Map();
  allAttempts.forEach((att) => {
    const key = `${att.studentId}_${att.quizId}`;
    if (!studentQuizMap.has(key)) {
      studentQuizMap.set(key, []);
    }
    studentQuizMap.get(key).push(att);
  });

  // Process student quiz performance records
  const studentRows = [];
  const uniqueStudentsSet = new Set();
  const studentsWithRetestsSet = new Set();
  let totalRetestAttempts = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalScoreSum = 0;

  studentQuizMap.forEach((attemptsList) => {
    // Sort attempts chronologically
    attemptsList.sort((a, b) => new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime() || (Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, ''))));

    const first = attemptsList[0];
    const latest = attemptsList[attemptsList.length - 1];
    const attemptCount = attemptsList.length;
    const retests = Math.max(0, attemptCount - 1);
    const bestScore = Math.max(...attemptsList.map((a) => Number(a.percentage) || 0));
    const latestScore = Number(latest.percentage) || 0;
    const firstScore = Number(first.percentage) || 0;

    uniqueStudentsSet.add(first.studentId);
    if (retests > 0) {
      studentsWithRetestsSet.add(first.studentId);
      totalRetestAttempts += retests;
    }

    attemptsList.forEach((a) => {
      totalScoreSum += Number(a.percentage) || 0;
      totalCorrect += Number(a.correctAnswers) || 0;
      totalQuestions += Number(a.totalQuestions) || 0;
    });

    let status = 'On Track';
    if (retests > 0 && latestScore > firstScore) {
      status = 'Improved';
    } else if (retests > 0 && latestScore === firstScore) {
      status = 'Consistent';
    } else if (retests > 0 && latestScore < firstScore) {
      status = 'Regressed';
    } else if (latestScore >= 80) {
      status = 'Mastered';
    } else if (latestScore < 50) {
      status = 'Needs Help';
    }

    studentRows.push({
      studentId: first.studentId,
      studentName: first.studentName,
      avatar: first.studentAvatar,
      className: first.className,
      section: first.section,
      quizId: first.quizId,
      numericQuizId: first.numericQuizId,
      quizTitle: first.quizTitle,
      subject: first.subject,
      firstAttemptScore: firstScore,
      retestsCount: retests,
      bestScore,
      latestScore,
      status,
      attemptsCount: attemptCount,
      lastAttemptDate: latest.completedAt,
    });
  });

  // Sort student rows by latest activity DESC, then status
  studentRows.sort((a, b) => new Date(b.lastAttemptDate || 0).getTime() - new Date(a.lastAttemptDate || 0).getTime());

  // Group by quizzes in this subject
  const allQuizzes = getQuizzesFromDb();
  const subjectQuizzes = allQuizzes.filter((q) => Number(q.classGrade) === Number(classGrade) && matchSubject(q.subject));

  const quizzesSummary = subjectQuizzes.map((q) => {
    const qRows = studentRows.filter((r) => String(r.quizId) === String(q.id) || String(r.numericQuizId) === String(q.numericId));
    const attemptedStudents = qRows.length;
    const retestedStudents = qRows.filter((r) => r.retestsCount > 0).length;
    const totalQAttempts = qRows.reduce((sum, r) => sum + r.attemptsCount, 0);
    const avgQScore = attemptedStudents > 0
      ? Math.round(qRows.reduce((sum, r) => sum + r.latestScore, 0) / attemptedStudents)
      : 0;

    return {
      id: q.id,
      numericId: q.numericId,
      title: q.title,
      subject: q.subject,
      chapter: q.chapter,
      studentsAttempted: attemptedStudents,
      studentsRetested: retestedStudents,
      totalAttempts: totalQAttempts,
      avgScore: avgQScore,
    };
  });

  const totalAttempts = allAttempts.length;
  const avgScore = totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : avgScore;

  return {
    subject: subjectName,
    classGrade: Number(classGrade),
    totalEnrolledStudents,
    uniqueStudentsCount: uniqueStudentsSet.size,
    totalQuizAttempts: totalAttempts,
    studentsWithRetestsCount: studentsWithRetestsSet.size,
    totalRetestAttempts,
    avgScore,
    accuracy,
    quizzes: quizzesSummary,
    students: studentRows,
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

  const sqlStatements = [
    'START TRANSACTION;',
    `INSERT INTO acadevia_quiz_db.quizzes
     (title, description, chapter_info, quiz_type, quiz_status, difficulty_level, subject, class_grade, board, language, total_questions, time_limit_minutes, pass_percentage, max_attempts, xp_reward, marks_per_question, total_marks, created_by)
     VALUES
     ('${title}', '${description}', ${chapterSql}, 'PRACTICE', 'ACTIVE', '${difficulty}', '${subject}', ${classGrade}, 'CBSE', 'en', ${totalQuestions}, ${timeLimitMin}, 60, 5, ${xpReward}, 10, ${totalMarks}, ${teacherId});`,
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
      (quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, explanation, subject, class_grade, board, topic, concept, difficulty_level, language, marks, xp_value, created_by)
      VALUES
      (@new_quiz_id, '${qText}', 'MCQ', '${optA}', '${optB}', '${optC}', '${optD}', '${correctLetter}', '${explanation}', '${subject}', ${classGrade}, 'CBSE', '${topic}', '${topic}', '${difficulty}', 'en', ${points}, ${points}, ${teacherId});
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
    teacherName: data.teacherName || 'Teacher',
    classGrade,
    subject: data.subject,
    chapter: chapterInfo,
    chapterInfo,
    title: data.title,
    description: data.description,
    timeLimit: Number(data.timeLimit) || 300,
    difficulty: (data.difficulty || 'medium').toLowerCase(),
    xpReward,
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
// 8. Content Items (PDF, Video, Image) from acadevia_content
// ---------------------------------------------------------------------------

function normalizeChapter(name) {
  if (!name) return '';
  return String(name).toLowerCase().replace(/^chapter\s*\d+[\s:.-]*/i, '').trim();
}

const DEFAULT_REAL_NUMBERS_VIDEO = {
  id: '3',
  title: 'Real Numbers',
  description: "Comprehensive Chapter 1 coverage of Real Numbers for Class 10 CBSE/State Board. Covers Euclid's Division Lemma, Fundamental Theorem of Arithmetic, and proofs of irrationality.",
  cloudinaryUrl: '/api/v1/content/videos/3/stream',
  downloadUrl: '/api/v1/content/videos/3/download',
  downloadOptions: [
    {
      quality: '720p',
      label: '720p HD (Original)',
      fileSizeMb: 408.83,
      downloadUrl: '/api/v1/content/videos/3/download',
    },
  ],
  thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
  subject: 'Mathematics',
  classGrade: 10,
  chapter: 'Real Numbers',
  language: 'en',
  duration: 4596,
  uploadedBy: 'Faculty',
  uploadedAt: '2026-09-04T12:00:00.000Z',
  fileSize: 428691985,
  contentType: 'VIDEO',
  fileName: 'Real Numbers Class 10  Maths Full chapter in One Shot  NCERT Chapter 1  CBSE New Syllabus  10th_720p.mp4',
  mimeType: 'video/mp4',
};

function getContentItemsFromDb() {
  if (isFresh(serverCache.contentItems)) {
    return serverCache.contentItems.data;
  }
  const result = [];
  const seenIds = new Set();

  // 1. Primary: Query videos from acadevia_content.videos
  try {
    const videoQuery = `
      SELECT 
        id,
        title,
        description,
        class_grade as classGrade,
        subject,
        chapter,
        object_key as objectKey,
        bucket,
        original_filename as fileName,
        content_type as mimeType,
        file_size_bytes as fileSize,
        duration_seconds as duration,
        language_code as language,
        created_at as uploadedAt
      FROM acadevia_content.videos
      WHERE is_published = 1 OR is_active = 1
      ORDER BY id DESC;
    `;
    const videoRows = execSql(videoQuery);
    videoRows.forEach((r) => {
      const vidId = String(r.id);
      seenIds.add(vidId);
      result.push({
        id: vidId,
        title: r.title,
        description: r.description || '',
        cloudinaryUrl: `/api/v1/content/videos/${vidId}/stream`,
        downloadUrl: `/api/v1/content/videos/${vidId}/download`,
        downloadOptions: [
          {
            quality: '720p',
            label: '720p HD (Original)',
            fileSizeMb: r.fileSize ? Math.round((Number(r.fileSize) / (1024 * 1024)) * 100) / 100 : 408.83,
            downloadUrl: `/api/v1/content/videos/${vidId}/download`,
          },
        ],
        cloudinaryPublicId: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
        subject: r.subject || 'Mathematics',
        classGrade: Number(r.classGrade) || 10,
        chapter: r.chapter || 'Real Numbers',
        language: r.language || 'en',
        uploadedBy: 'Faculty',
        uploadedAt: r.uploadedAt || new Date().toISOString(),
        fileSize: Number(r.fileSize) || 428691985,
        duration: Number(r.duration) || 4596,
        contentType: 'VIDEO',
        fileName: r.fileName || 'Real Numbers Class 10.mp4',
        mimeType: r.mimeType || 'video/mp4',
      });
    });
  } catch (err) {
    console.warn('Failed to query acadevia_content.videos:', err.message);
  }

  // 2. Query documents & items from acadevia_content.content_items
  try {
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
      FROM acadevia_content.content_items
      ORDER BY id DESC;
    `;
    const rows = execSql(query);
    rows.forEach((r) => {
      const id = `cnt-${r.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        result.push({
          id,
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
          duration: Number(r.duration) || 0,
          contentType: r.contentType || 'PDF',
          fileName: r.fileName,
          mimeType: r.mimeType,
        });
      }
    });
  } catch {
    // Ignore if table not yet seeded
  }

  // 3. Resilient Fallback: Always ensure Real Numbers Video 3 is present
  if (!seenIds.has('3')) {
    result.push(DEFAULT_REAL_NUMBERS_VIDEO);
  }

  serverCache.contentItems = { data: result, timestamp: Date.now() };
  return result;
}

function getChapterVideosFromDb(classGrade, subject, chapter) {
  const allItems = getContentItemsFromDb();
  const cg = Number(classGrade) || 10;
  const sub = String(subject || '').toLowerCase().trim();
  const chapNorm = normalizeChapter(chapter);

  const matched = allItems.filter((item) => {
    if (item.contentType !== 'VIDEO') return false;
    if (item.classGrade !== cg) return false;
    if (sub && item.subject.toLowerCase() !== sub) return false;
    if (!chapNorm) return true;
    const itemChapNorm = normalizeChapter(item.chapter);
    return (
      itemChapNorm === chapNorm ||
      itemChapNorm.includes(chapNorm) ||
      chapNorm.includes(itemChapNorm)
    );
  });

  return matched.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    playUrl: v.cloudinaryUrl || `/api/v1/content/videos/${v.id}/stream`,
    downloadUrl: v.downloadUrl || `/api/v1/content/videos/${v.id}/download`,
    downloadOptions: v.downloadOptions || [
      {
        quality: '720p',
        label: '720p HD (Original)',
        fileSizeMb: v.fileSize ? Math.round((v.fileSize / (1024 * 1024)) * 100) / 100 : 408.83,
        downloadUrl: v.downloadUrl || `/api/v1/content/videos/${v.id}/download`,
      },
    ],
    thumbnailUrl: v.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    subject: v.subject,
    classGrade: v.classGrade,
    chapter: v.chapter,
    languageCode: v.language || 'en',
    durationSeconds: v.duration || 4596,
    fileSizeBytes: v.fileSize || 428691985,
    fileSizeMb: v.fileSize ? Math.round((v.fileSize / (1024 * 1024)) * 100) / 100 : 408.83,
    originalFilename: v.fileName || `${v.title}.mp4`,
    contentType: 'video/mp4',
    uploadedBy: v.uploadedBy || 'Faculty',
    createdAt: v.uploadedAt,
  }));
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
    INSERT INTO acadevia_content.content_items
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
  const res = execSqlMutation(`DELETE FROM acadevia_content.content_items WHERE id = ${numericId};`);
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
function escapeSqlString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function getUserIdByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const clean = escapeSqlString(email.toLowerCase().trim());
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

  const courseId = params.courseId ? `'${escapeSqlString(params.courseId)}'` : 'NULL';
  const subject = escapeSqlString(params.subject || 'General');
  const chapter = escapeSqlString(params.chapter || 'General');
  const classGrade = Number(params.classGrade) || 10;
  const title = escapeSqlString(params.title || 'Lesson Video');
  const description = escapeSqlString(params.description || '');
  const contentType = escapeSqlString((params.contentType || 'VIDEO').toUpperCase());
  const fileUrl = escapeSqlString(params.fileUrl || '');
  const thumbnailUrl = escapeSqlString(params.thumbnailUrl || '');
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
    INSERT INTO acadevia_content.student_learning_progress
    (student_id, content_id, course_id, subject, chapter, class_grade, title, description, content_type, file_url, thumbnail_url, last_position_seconds, duration_seconds, progress_percent, completed, last_watched_at)
    VALUES
    (${studentId}, '${escapeSqlString(contentId)}', ${courseId}, '${subject}', '${chapter}', ${classGrade}, '${title}', '${description}', '${contentType}', '${fileUrl}', '${thumbnailUrl}', ${lastPos}, ${duration}, ${progressPct}, ${completed}, '${lastWatchedAt}')
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
    FROM acadevia_content.student_learning_progress
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
    FROM acadevia_content.student_learning_progress
    WHERE student_id = ${numId} AND content_id = '${escapeSqlString(contentId)}'
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

function calculateStreakFromDates(dates) {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  const uniqueDays = Array.from(
    new Set(
      dates.map((d) => {
        const dateObj = new Date(d);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      }),
    ),
  ).sort().reverse();

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i + 1]);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  if (uniqueDays.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i + 1]);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  return { currentStreak, longestStreak };
}

function recalculateAllStudentStatsInDb() {
  const students = execSql("SELECT id FROM acadevia_auth_db.users WHERE role = 'STUDENT' AND is_active = 1;");
  for (const st of students) {
    const dates = execSql(`SELECT DISTINCT completed_at FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${st.id} ORDER BY completed_at DESC;`).map((r) => r.completed_at);
    const { currentStreak, longestStreak } = calculateStreakFromDates(dates);
    execSqlMutation(`
      UPDATE acadevia_auth_db.users
      SET
        total_xp = (SELECT COALESCE(SUM(xp_earned), 0) FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${st.id}),
        current_level = FLOOR((SELECT COALESCE(SUM(xp_earned), 0) FROM acadevia_quiz_db.quiz_attempts WHERE user_id = ${st.id}) / 500) + 1,
        current_streak = ${currentStreak},
        longest_streak = ${longestStreak}
      WHERE id = ${st.id};
    `);
  }
  invalidateServerCache();
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
  getQuizAttemptsFromDb,
  submitAttemptToDb,
  createQuizInDb,
  deleteQuizFromDb,
  getContentItemsFromDb,
  getChapterVideosFromDb,
  getR2PresignedUrl,
  createContentItemInDb,
  deleteContentItemFromDb,
  getFullDatabaseState,
  getLeaderboardFromDb,
  saveLearningProgress,
  getRecentLearningProgress,
  getLearningProgressByContent,
  getUserIdByEmail,
  getStudentProfileFromDb,
  recalculateAllStudentStatsInDb,
  calculateStreakFromDates,
  getSubjectMasteryDetailFromDb,
  initQuestionMasteryTable,
};
