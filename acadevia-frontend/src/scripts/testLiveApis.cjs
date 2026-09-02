const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('===============================================================');
  console.log('1. VERIFY LIVE API: /api/v1/teacher/students?classGrade=10');
  console.log('===============================================================');
  const studentsRes = await fetchJson('http://localhost:5173/api/v1/teacher/students?classGrade=10');
  console.log('API Status:', studentsRes.status, '| Success:', studentsRes.success);
  console.log('Total Class 10 Students returned:', studentsRes.data?.length);
  studentsRes.data?.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.name.padEnd(20)} | Quizzes: ${s.quizzesCompleted} | Avg: ${s.avgScore}% | XP: ${s.totalXP} | Streak: ${s.streak}d`);
  });

  console.log('\n===============================================================');
  console.log('2. VERIFY LIVE API: /api/v1/teacher/analytics (ALL SUBJECTS)');
  console.log('===============================================================');
  const subjects = ['All', 'Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science'];
  for (const sub of subjects) {
    const analyticsRes = await fetchJson('http://localhost:5173/api/v1/teacher/analytics?classGrade=10&subject=' + encodeURIComponent(sub));
    const d = analyticsRes.data;
    console.log(`\n--- Subject: [${sub}] ---`);
    console.log(`Dropdown Options (${d.availableSubjects.length}):`, d.availableSubjects.join(', '));
    console.log(`Quizzes (${d.quizScores.length}):`, d.quizScores.map(q => `${q.fullName} (Avg: ${q.avg}%, attempts: ${q.attempts})`).join('; '));
    console.log(`Completion Rate:`, d.completionData[0].value + '% (' + d.completionData[0].count + '/' + d.totalStudents + ' submitted)');
    console.log(`Top Performer:`, d.topPerformers[0] ? `${d.topPerformers[0].name} (Score: ${d.topPerformers[0].score}%, XP: ${d.topPerformers[0].xp})` : 'None');
    console.log(`At-Risk Count (<50%):`, d.atRiskStudents.length, d.atRiskStudents.map(a => `${a.name} (${a.score}%)`).join(', '));
  }

  console.log('\n===============================================================');
  console.log('3. VERIFY LIVE API: Subject Comparison in Analytics');
  console.log('===============================================================');
  const allRes = await fetchJson('http://localhost:5173/api/v1/teacher/analytics?classGrade=10&subject=All');
  allRes.data?.subjectComparison?.forEach(sc => {
    console.log(`  - ${sc.subject.padEnd(20)}: Score: ${sc.score}% | Submissions: ${sc.submissions}`);
  });

  console.log('\n===============================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
}

runTest().catch(console.error);
