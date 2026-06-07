/**
 * PrepRoute Admin Backend
 * Express REST API with in-memory store
 * Deploy to Render as a Web Service with: npm install && npm start
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'preproute-secret-change-in-production';

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// ─── In-Memory Data Store ──────────────────────────────────────────────────────

const db = {
  users: [
    { id: 'u1', username: 'vedant-admin', password: 'vedant123', name: 'Alex Wando', role: 'Admin' },
    { id: 'u2', username: 'admin', password: 'admin123', name: 'Admin User', role: 'Admin' },
  ],
  subjects: [
    { id: 's1', name: 'English' },
    { id: 's2', name: 'Physics' },
    { id: 's3', name: 'Mathematics' },
    { id: 's4', name: 'Chemistry' },
    { id: 's5', name: 'Biology' },
  ],
  topics: [
    { id: 't1', name: 'Grammar', subjectId: 's1' },
    { id: 't2', name: 'Writing', subjectId: 's1' },
    { id: 't3', name: 'Reading', subjectId: 's1' },
    { id: 't4', name: 'Mechanics', subjectId: 's2' },
    { id: 't5', name: 'Optics', subjectId: 's2' },
    { id: 't6', name: 'Thermodynamics', subjectId: 's2' },
    { id: 't7', name: 'Algebra', subjectId: 's3' },
    { id: 't8', name: 'Calculus', subjectId: 's3' },
    { id: 't9', name: 'Geometry', subjectId: 's3' },
    { id: 't10', name: 'Organic Chemistry', subjectId: 's4' },
    { id: 't11', name: 'Inorganic Chemistry', subjectId: 's4' },
    { id: 't12', name: 'Botany', subjectId: 's5' },
    { id: 't13', name: 'Zoology', subjectId: 's5' },
  ],
  subTopics: [
    { id: 'st1', name: 'Application', topicId: 't1' },
    { id: 'st2', name: 'Theory', topicId: 't1' },
    { id: 'st3', name: 'Essays', topicId: 't2' },
    { id: 'st4', name: 'Reports', topicId: 't2' },
    { id: 'st5', name: "Newton's Laws", topicId: 't4' },
    { id: 'st6', name: 'Kinematics', topicId: 't4' },
    { id: 'st7', name: 'Wave Optics', topicId: 't5' },
    { id: 'st8', name: 'Linear Equations', topicId: 't7' },
    { id: 'st9', name: 'Quadratic Equations', topicId: 't7' },
    { id: 'st10', name: 'Differentiation', topicId: 't8' },
    { id: 'st11', name: 'Integration', topicId: 't8' },
  ],
  tests: [
    {
      id: 'test-1',
      name: 'Chapter 1 – Grammar Basics',
      type: 'CHAPTERWISE',
      subject: 'English',
      subjectId: 's1',
      topic: ['Grammar', 'Writing'],
      topicIds: ['t1', 't2'],
      subTopic: ['Application'],
      subTopicIds: ['st1'],
      duration: 60,
      difficulty: 'EASY',
      markingScheme: { correct: 5, wrong: -1, unattempted: 0 },
      totalQuestions: 50,
      totalMarks: 250,
      status: 'PUBLISHED',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'test-2',
      name: 'Physics PYQ – 2023',
      type: 'PYQ',
      subject: 'Physics',
      subjectId: 's2',
      topic: ['Mechanics', 'Optics'],
      topicIds: ['t4', 't5'],
      subTopic: [],
      subTopicIds: [],
      duration: 180,
      difficulty: 'DIFFICULT',
      markingScheme: { correct: 4, wrong: -1, unattempted: 0 },
      totalQuestions: 90,
      totalMarks: 360,
      status: 'PUBLISHED',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
    },
    {
      id: 'test-3',
      name: 'Math Full Mock Test',
      type: 'MOCK_TEST',
      subject: 'Mathematics',
      subjectId: 's3',
      topic: ['Algebra', 'Calculus'],
      topicIds: ['t7', 't8'],
      subTopic: [],
      subTopicIds: [],
      duration: 120,
      difficulty: 'MEDIUM',
      markingScheme: { correct: 4, wrong: -1, unattempted: 0 },
      totalQuestions: 60,
      totalMarks: 240,
      status: 'DRAFT',
      createdAt: '2024-02-01T08:00:00Z',
      updatedAt: '2024-02-01T08:00:00Z',
    },
  ],
  questions: {},   // { [testId]: Question[] }
};

// ─── Auth Middleware ───────────────────────────────────────────────────────────

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Allow demo tokens (prefixed with "demo-token-")
    if (token.startsWith('demo-token-')) {
      req.user = { id: 'u1', username: 'vedant-admin', role: 'Admin' };
      return next();
    }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

function resolveTestNames(test) {
  const subject = db.subjects.find(s => s.id === test.subjectId);
  const topics = db.topics.filter(t => test.topicIds.includes(t.id));
  const subTopics = db.subTopics.filter(st => test.subTopicIds.includes(st.id));
  return {
    ...test,
    subject: subject?.name ?? test.subject ?? '',
    topic: topics.map(t => t.name),
    subTopic: subTopics.map(st => st.name),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: now() });
});

// ── Auth ─────────────────────────────────────────────────────────────────────

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = db.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { password: _pw, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ token, user: safeUser });
});

// ── Subjects ─────────────────────────────────────────────────────────────────

router.get('/subjects', authenticate, (_req, res) => {
  res.json(db.subjects);
});

// ── Topics ───────────────────────────────────────────────────────────────────

router.get('/topics', authenticate, (req, res) => {
  const { subjectId } = req.query;
  const topics = subjectId
    ? db.topics.filter(t => t.subjectId === subjectId)
    : db.topics;
  res.json(topics);
});

// ── Sub-Topics ────────────────────────────────────────────────────────────────

router.get('/subtopics', authenticate, (req, res) => {
  const { topicId } = req.query;
  const subTopics = topicId
    ? db.subTopics.filter(st => st.topicId === topicId)
    : db.subTopics;
  res.json(subTopics);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

// List all tests
router.get('/tests', authenticate, (_req, res) => {
  const resolved = db.tests.map(resolveTestNames);
  res.json(resolved);
});

// Get single test
router.get('/tests/:id', authenticate, (req, res) => {
  const test = db.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(resolveTestNames(test));
});

// Create test
router.post('/tests', authenticate, (req, res) => {
  const { name, type, subjectId, topicIds, subTopicIds, duration, difficulty, markingScheme, totalQuestions } = req.body;

  if (!name || !type || !subjectId) {
    return res.status(400).json({ message: 'name, type, and subjectId are required' });
  }

  const subject = db.subjects.find(s => s.id === subjectId);
  const topics = db.topics.filter(t => (topicIds || []).includes(t.id));
  const subTopics = db.subTopics.filter(st => (subTopicIds || []).includes(st.id));

  const test = {
    id: uuidv4(),
    name,
    type,
    subjectId,
    subject: subject?.name ?? '',
    topicIds: topicIds ?? [],
    topic: topics.map(t => t.name),
    subTopicIds: subTopicIds ?? [],
    subTopic: subTopics.map(st => st.name),
    duration: duration ?? 60,
    difficulty: difficulty ?? 'EASY',
    markingScheme: markingScheme ?? { correct: 4, wrong: -1, unattempted: 0 },
    totalQuestions: totalQuestions ?? 50,
    totalMarks: (totalQuestions ?? 50) * (markingScheme?.correct ?? 4),
    status: 'DRAFT',
    createdAt: now(),
    updatedAt: now(),
  };

  db.tests.push(test);
  db.questions[test.id] = [];

  return res.status(201).json(test);
});

// Update test
router.put('/tests/:id', authenticate, (req, res) => {
  const idx = db.tests.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Test not found' });

  const existing = db.tests[idx];
  const { name, type, subjectId, topicIds, subTopicIds, duration, difficulty, markingScheme, totalQuestions } = req.body;

  const subject = db.subjects.find(s => s.id === (subjectId ?? existing.subjectId));
  const resolvedTopicIds = topicIds ?? existing.topicIds;
  const resolvedSubTopicIds = subTopicIds ?? existing.subTopicIds;
  const topics = db.topics.filter(t => resolvedTopicIds.includes(t.id));
  const subTopics = db.subTopics.filter(st => resolvedSubTopicIds.includes(st.id));
  const resolvedMarkingScheme = markingScheme ?? existing.markingScheme;
  const resolvedTotalQ = totalQuestions ?? existing.totalQuestions;

  const updated = {
    ...existing,
    name: name ?? existing.name,
    type: type ?? existing.type,
    subjectId: subjectId ?? existing.subjectId,
    subject: subject?.name ?? existing.subject,
    topicIds: resolvedTopicIds,
    topic: topics.map(t => t.name),
    subTopicIds: resolvedSubTopicIds,
    subTopic: subTopics.map(st => st.name),
    duration: duration ?? existing.duration,
    difficulty: difficulty ?? existing.difficulty,
    markingScheme: resolvedMarkingScheme,
    totalQuestions: resolvedTotalQ,
    totalMarks: resolvedTotalQ * (resolvedMarkingScheme?.correct ?? existing.markingScheme.correct),
    updatedAt: now(),
  };

  db.tests[idx] = updated;
  return res.json(updated);
});

// Delete test
router.delete('/tests/:id', authenticate, (req, res) => {
  const idx = db.tests.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Test not found' });
  db.tests.splice(idx, 1);
  delete db.questions[req.params.id];
  return res.status(204).send();
});

// Publish test
router.post('/tests/:id/publish', authenticate, (req, res) => {
  const idx = db.tests.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Test not found' });

  const { publishNow, scheduledAt, liveUntil } = req.body;
  const test = db.tests[idx];

  const updated = {
    ...test,
    status: publishNow ? 'PUBLISHED' : 'SCHEDULED',
    publishedAt: publishNow ? now() : undefined,
    scheduledAt: !publishNow && scheduledAt ? scheduledAt : undefined,
    liveUntil: liveUntil ?? undefined,
    updatedAt: now(),
  };

  db.tests[idx] = updated;
  return res.json(updated);
});

// ── Questions ─────────────────────────────────────────────────────────────────

// Get questions for a test
router.get('/tests/:id/questions', authenticate, (req, res) => {
  const test = db.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  const questions = db.questions[req.params.id] ?? [];
  res.json(questions);
});

// Create question
router.post('/tests/:id/questions', authenticate, (req, res) => {
  const test = db.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });

  const { content, options, solution, difficulty, topicId, subTopicId } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Question content is required' });
  }

  if (!db.questions[req.params.id]) {
    db.questions[req.params.id] = [];
  }

  const question = {
    id: uuidv4(),
    testId: req.params.id,
    questionNumber: db.questions[req.params.id].length + 1,
    content,
    options: (options ?? []).map((o, i) => ({ id: uuidv4(), text: o.text, isCorrect: o.isCorrect ?? false, order: i })),
    solution: solution ?? '',
    difficulty: difficulty ?? 'EASY',
    topicId: topicId ?? null,
    subTopicId: subTopicId ?? null,
    createdAt: now(),
  };

  db.questions[req.params.id].push(question);
  return res.status(201).json(question);
});

// Update question
router.put('/tests/:id/questions/:questionId', authenticate, (req, res) => {
  const questions = db.questions[req.params.id];
  if (!questions) return res.status(404).json({ message: 'Test not found' });

  const idx = questions.findIndex(q => q.id === req.params.questionId);
  if (idx === -1) return res.status(404).json({ message: 'Question not found' });

  const existing = questions[idx];
  const { content, options, solution, difficulty, topicId, subTopicId } = req.body;

  const updated = {
    ...existing,
    content: content ?? existing.content,
    options: options
      ? options.map((o, i) => ({ id: o.id ?? uuidv4(), text: o.text, isCorrect: o.isCorrect ?? false, order: i }))
      : existing.options,
    solution: solution ?? existing.solution,
    difficulty: difficulty ?? existing.difficulty,
    topicId: topicId !== undefined ? topicId : existing.topicId,
    subTopicId: subTopicId !== undefined ? subTopicId : existing.subTopicId,
  };

  questions[idx] = updated;
  return res.json(updated);
});

// Delete question
router.delete('/tests/:id/questions/:questionId', authenticate, (req, res) => {
  const questions = db.questions[req.params.id];
  if (!questions) return res.status(404).json({ message: 'Test not found' });

  const idx = questions.findIndex(q => q.id === req.params.questionId);
  if (idx === -1) return res.status(404).json({ message: 'Question not found' });

  questions.splice(idx, 1);
  // Re-number remaining questions
  questions.forEach((q, i) => { q.questionNumber = i + 1; });
  return res.status(204).send();
});

// Bulk import questions (CSV)
router.post('/tests/:id/questions/bulk', authenticate, upload.single('file'), (req, res) => {
  const test = db.tests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  // Parse CSV: expected columns: content, optionA, optionB, optionC, optionD, correctOption, solution, difficulty
  const csv = req.file.buffer.toString('utf-8');
  const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  if (!db.questions[req.params.id]) db.questions[req.params.id] = [];
  const created = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });

    const optionLabels = ['optiona', 'optionb', 'optionc', 'optiond'];
    const correct = (row['correctoption'] || 'A').toUpperCase();
    const options = optionLabels.map((key, idx) => ({
      id: uuidv4(),
      text: row[key] ?? `Option ${String.fromCharCode(65 + idx)}`,
      isCorrect: String.fromCharCode(65 + idx) === correct,
    }));

    const question = {
      id: uuidv4(),
      testId: req.params.id,
      questionNumber: db.questions[req.params.id].length + 1,
      content: row['content'] || `Question ${i}`,
      options,
      solution: row['solution'] || '',
      difficulty: (row['difficulty'] || 'EASY').toUpperCase(),
      topicId: null,
      subTopicId: null,
      createdAt: now(),
    };

    db.questions[req.params.id].push(question);
    created.push(question);
  }

  return res.status(201).json(created);
});

// ─── Mount Router ─────────────────────────────────────────────────────────────

app.use('/api', router);

// Root
app.get('/', (_req, res) => {
  res.json({ name: 'PrepRoute API', version: '1.0.0', status: 'running' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`PrepRoute API running on port ${PORT}`);
});
