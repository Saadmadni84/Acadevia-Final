const db = require('./databaseApi.cjs');

// Student Proficiency Profiles
// High: 85-95%, Good: 70-82%, Average: 55-68%, Developing: 35-48%
const STUDENT_PROFILES = {
  // Top tier
  '20': { accuracy: 0.95, name: 'Aarav Sharma' },
  '24': { accuracy: 0.90, name: 'Arjun Patel' },
  '25': { accuracy: 0.88, name: 'Kavya Gupta' },
  '21': { accuracy: 0.86, name: 'Ananya Verma' },
  '2':  { accuracy: 0.92, name: 'Aditya Kumar Yadav' },

  // Good / Above average
  '22': { accuracy: 0.78, name: 'Rohan Mehta' },
  '26': { accuracy: 0.74, name: 'Aditya Kumar' },
  '4':  { accuracy: 0.80, name: 'GAURAV SINGH' },
  '30': { accuracy: 0.76, name: 'Suryansh Dubey' },
  '6':  { accuracy: 0.75, name: 'NIKHIL KUMAR' },
  '35': { accuracy: 0.72, name: 'Test Student' },

  // Average / Mixed
  '23': { accuracy: 0.65, name: 'Priya Singh' },
  '27': { accuracy: 0.62, name: 'Ishita Rao' },
  '3':  { accuracy: 0.60, name: 'Aditya Kumar' },
  '5':  { accuracy: 0.58, name: 'Aditya User' },
  '36': { accuracy: 0.55, name: 'alok User' },

  // Developing / Below average
  '29': { accuracy: 0.45, name: 'Meera Nair' },
  '28': { accuracy: 0.40, name: 'Vihaan Joshi' },
  '8':  { accuracy: 0.42, name: 'dddd User' },
  '34': { accuracy: 0.38, name: 'sher User' },
  '33': { accuracy: 0.35, name: 'Suryansh Dubey' },
};

// Curriculum Subjects & Quizzes
const SUBJECT_QUIZZES = {
  'Mathematics': [1, 101, 107, 108],
  'Science': [2, 3, 102], // Physics, Chemistry, Science
  'English': [103, 109],
  'Hindi': [104, 110],
  'Social Science': [105, 111],
  'Computer Science': [106, 112],
};

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function runBulkPopulation() {
  console.log('====================================================');
  console.log('STARTING REAL STUDENT BULK QUIZ ACTIVITY POPULATION');
  console.log('====================================================');

  // 1. Fetch all real students
  const students = db.execSql("SELECT id, email, first_name, last_name, class_grade FROM acadevia_auth_db.users WHERE role = 'STUDENT' AND is_active = 1 ORDER BY class_grade, id;");
  console.log(`Found ${students.length} real registered students in database roster.`);

  // 2. Query all existing attempts to ensure idempotency and prevent duplicate XP
  const existingRows = db.execSql("SELECT quiz_id, user_id FROM acadevia_quiz_db.quiz_attempts;");
  const existingSet = new Set(existingRows.map((r) => `${r.user_id}-${r.quiz_id}`));
  console.log(`Found ${existingRows.length} existing quiz attempts in database. Duplicate submissions will be skipped.`);

  // 3. Load all quizzes from database
  const allQuizzes = db.getQuizzesFromDb();
  const quizMap = {};
  allQuizzes.forEach((q) => {
    quizMap[String(q.numericId)] = q;
  });

  let totalNewAttempts = 0;
  let totalSkippedAttempts = 0;

  const now = Date.now();

  for (const st of students) {
    const studentId = Number(st.id);
    const profile = STUDENT_PROFILES[String(studentId)] || { accuracy: 0.60, name: `${st.first_name} ${st.last_name}` };
    console.log(`\nProcessing student #${studentId}: ${st.first_name} ${st.last_name} (Class ${st.class_grade}, Target Accuracy: ${Math.round(profile.accuracy * 100)}%)...`);

    let studentAttemptsCount = 0;

    for (const [subject, quizIds] of Object.entries(SUBJECT_QUIZZES)) {
      // Determine which 2-3 quizzes this student should take for this subject
      let assignedQuizzes = [];
      if (quizIds.length <= 2) {
        assignedQuizzes = quizIds;
      } else if (quizIds.length === 3) {
        // Pick 2-3 quizzes based on studentId
        if (studentId % 2 === 0) {
          assignedQuizzes = quizIds; // Take all 3
        } else {
          assignedQuizzes = [quizIds[0], quizIds[(studentId % 2) + 1]]; // Take 2
        }
      } else if (quizIds.length === 4) {
        // For Math (4 quizzes), assign 2-3 quizzes
        const offset = studentId % 4;
        assignedQuizzes = [
          quizIds[offset % 4],
          quizIds[(offset + 1) % 4],
          quizIds[(offset + 2) % 4],
        ];
      }

      for (const qId of assignedQuizzes) {
        const quizKey = `${studentId}-${qId}`;
        if (existingSet.has(quizKey)) {
          totalSkippedAttempts++;
          continue;
        }

        const quiz = quizMap[String(qId)];
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          console.warn(`Quiz ${qId} questions not found, skipping.`);
          continue;
        }

        // Generate varied authentic answers based on student proficiency
        const answers = quiz.questions.map((q) => {
          const isCorrect = Math.random() < profile.accuracy;
          if (isCorrect) {
            return q.correctIndex;
          } else {
            const numOpts = (q.options && q.options.length > 0) ? q.options.length : 4;
            const wrongOpts = [];
            for (let i = 0; i < numOpts; i++) {
              if (i !== q.correctIndex) wrongOpts.push(i);
            }
            return wrongOpts[Math.floor(Math.random() * wrongOpts.length)] ?? ((q.correctIndex + 1) % numOpts);
          }
        });

        const timeTakenSeconds = 120 + Math.floor(Math.random() * 140);
        // Distribute completion timestamps over the past 4 days to build natural activity streaks
        const daysAgo = (studentAttemptsCount % 4);
        const hoursAgo = Math.floor(Math.random() * 6);
        const minutesAgo = Math.floor(Math.random() * 50);
        const completedDate = new Date(now - (daysAgo * 86400000) - (hoursAgo * 3600000) - (minutesAgo * 60000));
        const completedAt = formatDate(completedDate);

        // Submit attempt through the real domain grading, scoring, and persistence logic
        const result = db.submitAttemptToDb({
          quizId: String(qId),
          studentId,
          answers,
          timeTakenSeconds,
          completedAt,
        });

        existingSet.add(quizKey);
        totalNewAttempts++;
        studentAttemptsCount++;
      }
    }
    console.log(`  -> Student #${studentId} submitted ${studentAttemptsCount} new graded quiz attempts.`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`Bulk Submission Complete! New attempts created: ${totalNewAttempts}, Skipped existing: ${totalSkippedAttempts}`);
  console.log('Reconciling streaks and total XP for all students...');

  // 4. Reconcile student streaks and level in database from actual attempt dates
  db.recalculateAllStudentStatsInDb();

  console.log('Database reconciliation complete.');
  console.log('====================================================');
}

runBulkPopulation().catch(console.error);
