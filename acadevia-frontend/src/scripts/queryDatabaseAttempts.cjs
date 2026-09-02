const { execSync } = require('child_process');

function getAttemptsFromDatabase() {
  try {
    const query = 'SELECT a.id, a.quiz_id, a.user_id, a.score, a.total_marks, a.percentage, a.is_passed, a.total_questions, a.correct_answers, a.wrong_answers, a.time_taken_seconds, a.xp_earned, a.completed_at, q.title as quiz_title, q.subject, u.first_name, u.last_name FROM acadevia_quiz_db.quiz_attempts a JOIN acadevia_quiz_db.quizzes q ON a.quiz_id = q.id JOIN acadevia_auth_db.users u ON a.user_id = u.id WHERE a.user_id BETWEEN 20 AND 29 ORDER BY a.id;';
    const output = execSync(`docker exec acadevia-mysql mysql -uroot -proot -e "${query}" -B`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();

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
    console.error('Failed to query database:', err);
    return [];
  }
}

if (require.main === module) {
  const attempts = getAttemptsFromDatabase();
  console.log(`Successfully retrieved ${attempts.length} attempts from MySQL database.`);
  if (attempts.length > 0) {
    console.log('Sample attempt:', attempts[0]);
  }
}

module.exports = { getAttemptsFromDatabase };
