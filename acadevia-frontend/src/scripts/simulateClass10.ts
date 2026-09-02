/**
 * Class 10 Real-Life Quiz Simulation Runner
 *
 * Usage: npm run simulate:class10
 */

import { executeClass10Simulation } from '../services/class10Simulation.service';
import { dataService } from '../services/data.service';

console.log('=================================================================');
console.log('  STARTING REAL-LIFE CLASS 10 QUIZ & ASSESSMENT SIMULATION       ');
console.log('=================================================================');

const summary = executeClass10Simulation();

console.log(`\n✅ Simulation Completed Successfully!`);
console.log(`- Participating Class 10 Students: ${summary.totalStudents}`);
console.log(`- Curriculum Subjects Assessed:    ${summary.totalQuizzes}`);
console.log(`- Total Submissions Processed:     ${summary.totalSubmissions}`);
console.log(`- Overall Class Average Score:     ${summary.classAverage}%`);
console.log(`- Class Quiz Completion Rate:      ${summary.completionRate}%`);

console.log('\n--- TOP PERFORMERS (Score >= 80%) ---');
summary.topPerformers.forEach((s, idx) => {
  console.log(`  ${idx + 1}. ${s.name.padEnd(20)} | Avg: ${s.avgScore}% | XP: ${s.xp}`);
});

console.log('\n--- AT-RISK STUDENTS (Score < 50%) ---');
summary.atRiskStudents.forEach((s, idx) => {
  console.log(`  ${idx + 1}. ${s.name.padEnd(20)} | Avg: ${s.avgScore}% (Needs Intervention)`);
});

console.log('\n--- SUBJECT-WISE PERFORMANCE ---');
Object.entries(summary.subjectAverages).forEach(([sub, avg]) => {
  console.log(`  - ${sub.padEnd(20)}: ${avg}%`);
});

// Check Teacher Rahul Verma's Class 10 Analytics
const teacherAnalytics = dataService.getClassAnalytics({ teacherId: '10', classGrade: 10 });
console.log('\n--- VERIFYING TEACHER (Rahul Verma) ANALYTICS ---');
console.log(`- Total Class Students:          ${teacherAnalytics.totalStudents}`);
console.log(`- Mathematics Quiz Average:      ${teacherAnalytics.quizScores[0]?.avg || 0}%`);
console.log(`- Mathematics Submissions Count: ${teacherAnalytics.quizScores[0]?.attempts || 0}`);
console.log(`- Top Performers in Math:        ${teacherAnalytics.topPerformers.length}`);
console.log(`- At-Risk Students in Math:      ${teacherAnalytics.atRiskStudents.length}`);
console.log('=================================================================\n');
