const { execSync } = require('child_process');

function execSql(query) {
  try {
    const singleLineQuery = query.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
    const cmd = `docker exec acadevia-mysql mysql -uroot -proot -e "${singleLineQuery}" -B`;
    const output = execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
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

function getTeacherStudentsFromDb(classGrade = 10) {
  const studentsQuery = `
    SELECT 
      u.id, 
      CONCAT(u.first_name, ' ', u.last_name) as name, 
      u.email,
      u.class_grade as classGrade,
      COUNT(a.id) as quizzesCompleted, 
      COALESCE(ROUND(AVG(a.percentage)), 0) as avgScore, 
      u.total_xp as totalXP, 
      u.current_level as level, 
      u.current_streak as streak,
      COALESCE(SUM(ROUND(a.time_taken_seconds / 60)), 0) as studyMinutes
    FROM acadevia_auth_db.users u 
    LEFT JOIN acadevia_quiz_db.quiz_attempts a ON u.id = a.user_id 
    WHERE u.class_grade = ${classGrade} AND u.role = 'STUDENT' AND u.id BETWEEN 20 AND 29
    GROUP BY u.id, u.first_name, u.last_name, u.email, u.class_grade, u.total_xp, u.current_level, u.current_streak
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

  return students.map((st) => {
    const studentAttempts = attempts.filter((att) => String(att.studentId) === String(st.id));
    const avgScore = Number(st.avgScore) || 0;
    const totalXP = Number(st.totalXP) || 0;
    const streak = Number(st.streak) || 0;
    const quizzesCompleted = studentAttempts.length;

    return {
      id: String(st.id),
      name: st.name,
      email: st.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(st.name)}`,
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
        quizId: String(att.quizId),
        quizTitle: att.quizTitle,
        subject: att.subject,
        studentId: String(att.studentId),
        studentName: att.studentName,
        classGrade: Number(classGrade),
        teacherId: String(att.teacherId),
        score: Number(att.score),
        maxScore: Number(att.maxScore),
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
}

function getTeacherAnalyticsFromDb(classGrade = 10, subject = 'All') {
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

  return {
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
}

if (require.main === module) {
  console.log('Testing getTeacherStudentsFromDb:');
  const students = getTeacherStudentsFromDb(10);
  console.log(`Loaded ${students.length} students:`);
  students.forEach((s) => {
    console.log(`  - ${s.name}: ${s.quizzesCompleted} quizzes, avg: ${s.avgScore}%, XP: ${s.totalXP}, streak: ${s.streak}d`);
  });

  console.log('\nTesting getTeacherAnalyticsFromDb (subject=All):');
  const analyticsAll = getTeacherAnalyticsFromDb(10, 'All');
  console.log(`  Total students: ${analyticsAll.totalStudents}`);
  console.log(`  Top performers: ${analyticsAll.topPerformers.map(p => `${p.name} (${p.score}%)`).join(', ')}`);
  console.log(`  At-Risk: ${analyticsAll.atRiskStudents.map(a => `${a.name} (${a.score}%)`).join(', ')}`);
  console.log(`  Subjects: ${analyticsAll.subjectComparison.map(s => `${s.subject}: ${s.score}%`).join(', ')}`);
}

module.exports = {
  getTeacherStudentsFromDb,
  getTeacherAnalyticsFromDb,
};
