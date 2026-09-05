/**
 * NCERT-MCP Bridge for Acadevia
 * Connects Acadevia's API layer directly with the local NCERT-MCP RAG engine.
 */
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');

const NCERT_MCP_DIR = path.resolve(__dirname, '../../../ncert-mcp');
const PYTHON_PATH = path.join(NCERT_MCP_DIR, '.venv', 'Scripts', 'python.exe');
const DB_PATH = path.join(NCERT_MCP_DIR, 'data', 'content.db');

/**
 * Get all available NCERT chapters currently indexed in content.db
 */
function getIndexedChapters(classGrade = 9, subject = 'Mathematics') {
  if (!fs.existsSync(DB_PATH) || !fs.existsSync(PYTHON_PATH)) {
    return [];
  }

  const script = `
import sys, json, sqlite3
sys.path.insert(0, 'src')
try:
    conn = sqlite3.connect('data/content.db')
    c = conn.cursor()
    rows = c.execute(
        "SELECT chapter, source_file, COUNT(*) FROM content_chunks WHERE grade=? AND LOWER(subject)=LOWER(?) GROUP BY chapter, source_file ORDER BY chapter",
        (${Number(classGrade)}, "${subject}")
    ).fetchall()
    
    from tools.filesystem import CHAPTER_TITLES
    iemh_titles = CHAPTER_TITLES.get('iemh1', [])
    
    results = []
    for r in rows:
        ch_num = r[0]
        # In Class 9 NCERT Ganita Manjari, Chapter 1 is Coordinates/Orienting Yourself
        title = "Coordinate Geometry" if ch_num == 1 else (iemh_titles[ch_num - 1] if ch_num <= len(iemh_titles) else f"Chapter {ch_num}")
        if ch_num == 1:
            title = "Coordinate Geometry"
        elif ch_num == 2:
            title = "Polynomials"
        elif ch_num == 3:
            title = "Linear Equations"
            
        results.append({
            "chapterNumber": ch_num,
            "title": title,
            "sourceFile": r[1],
            "chunkCount": r[2]
        })
    print(json.dumps(results))
except Exception as e:
    print(json.dumps([]))
`;

  try {
    const res = spawnSync(PYTHON_PATH, ['-c', script], {
      cwd: NCERT_MCP_DIR,
      encoding: 'utf8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    if (res.status === 0 && res.stdout.trim()) {
      const parsed = JSON.parse(res.stdout.trim());
      return parsed;
    }
  } catch (err) {
    console.error('[ncertBridge] Error fetching indexed chapters:', err.message);
  }

  return [];
}

/**
 * Generate 1 NCERT grounded question using NCERT-MCP
 */
function generateNcertQuestion({ grade = 9, subject = 'Mathematics', topic = 'Coordinate Geometry', difficulty = 'medium', bloomLevel = 'understand' }) {
  if (!fs.existsSync(PYTHON_PATH)) {
    throw new Error('NCERT-MCP python virtual environment not found at ' + PYTHON_PATH);
  }

  const pyScript = `
import sys, os, json, time
sys.path.insert(0, 'src')
sys.path.insert(0, '.')
from tools.generation import generate_question

# Retry loop for transient Google AI spikes
max_attempts = 3
question_data = None
last_err = None

for attempt in range(max_attempts):
    try:
        res = generate_question(
            grade=${Number(grade)},
            subject="${subject}",
            topic="${topic}",
            bloom_level="${bloomLevel}",
            difficulty="${difficulty}",
            question_type="MCQ",
            marks=10
        )
        if res and isinstance(res, dict) and "question" in res and "answer" in res:
            question_data = res
            break
        elif res and isinstance(res, dict) and "error" in res:
            last_err = res["error"]
            break
    except Exception as e:
        last_err = str(e)
        if "RESOURCE_EXHAUSTED" in str(last_err) or "429" in str(last_err):
            break
        time.sleep(2)

if question_data:
    print("SUCCESS_JSON:" + json.dumps(question_data))
else:
    print("ERROR_MSG:" + str(last_err))
`;

  const res = spawnSync(PYTHON_PATH, ['-c', pyScript], {
    cwd: NCERT_MCP_DIR,
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });

  if (res.error) {
    if (res.error.code === 'ETIMEDOUT') {
      throw new Error('NCERT question generation timed out. Please try again.');
    }
    throw new Error(res.error.message || 'Generation failed');
  }

  const output = res.stdout || '';
  if (output.includes('SUCCESS_JSON:')) {
    const jsonStr = output.split('SUCCESS_JSON:')[1].trim();
    const raw = JSON.parse(jsonStr);

    // Validate raw question
    const questionText = (raw.question || '').trim();
    const answer = (raw.answer || '').trim();
    const distractors = Array.isArray(raw.distractors) ? raw.distractors.map(d => String(d).trim()) : [];

    if (!questionText) throw new Error('Generated question was empty');
    if (!answer) throw new Error('Generated question missing correct answer');
    if (distractors.length !== 3) throw new Error(`Generated question has ${distractors.length} distractors (expected 3)`);

    // Formulate 4 unique options and shuffle safely
    const allOptions = [answer, ...distractors];
    // Check duplicates
    const uniqueOptions = Array.from(new Set(allOptions));
    if (uniqueOptions.length !== 4) {
      throw new Error('Generated question contained duplicate options');
    }

    // Deterministic or pseudo-random option placement
    // We shuffle options so correct answer isn't always option A
    const optionsWithOrder = allOptions.map((opt, i) => ({ opt, isCorrect: i === 0 }));
    // Simple modern shuffle
    for (let i = optionsWithOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithOrder[i], optionsWithOrder[j]] = [optionsWithOrder[j], optionsWithOrder[i]];
    }

    const options = optionsWithOrder.map(o => o.opt);
    const correctIndex = optionsWithOrder.findIndex(o => o.isCorrect);

    return {
      question: questionText,
      options,
      correctIndex,
      explanation: Array.isArray(raw.marking_scheme) ? raw.marking_scheme.join('; ') : (raw.explanation || 'Grounded in NCERT textbook theory.'),
      points: 10,
      topic,
      source: {
        type: 'NCERT',
        grade: Number(grade),
        subject,
        chapter: topic,
        bloomLevel: raw.bloom_level || bloomLevel,
        difficulty: raw.difficulty || difficulty
      }
    };
  } else if (output.includes('ERROR_MSG:')) {
    const msg = output.split('ERROR_MSG:')[1].trim();
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      throw new Error('Google Gemini API daily quota reached. Please try again later.');
    }
    throw new Error(msg || 'Failed to generate question from NCERT-MCP');
  } else {
    const rawStderr = (res.stderr || '').trim();
    const cleanStderr = rawStderr
      .split('\n')
      .filter(line => !line.includes('automatic function calling') && !line.includes('AFC') && !line.includes('UserWarning'))
      .join('\n')
      .trim();

    if (rawStderr.includes('RESOURCE_EXHAUSTED') || rawStderr.includes('429')) {
      throw new Error('Google Gemini API daily quota reached. Please try again later.');
    }
    throw new Error(cleanStderr || 'Generation failed with unexpected exit');
  }
}

module.exports = {
  getIndexedChapters,
  generateNcertQuestion
};
