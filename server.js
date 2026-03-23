// ============================================================
//  server.js — сервер StyleBase
//  Node.js + Express, база данных — файл db.json
// ============================================================
'use strict';

const express      = require('express');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');
const crypto       = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// ── Middleware ─────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));  // CSS-файлы передаём как текст в JSON
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── Работа с базой данных (файл db.json) ───────────────────
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { users: [], styles: [], sessions: {}, totalDownloads: 0 };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Инициализация db.json при первом запуске
if (!fs.existsSync(DB_PATH)) {
  const initDb = { users: [], styles: [], sessions: {}, totalDownloads: 0 };
  writeDB(initDb);
  console.log('db.json создан');
}

// Создаём администратора если его нет
(function ensureAdmin() {
  const db = readDB();
  if (!db.users.find(u => u.role === 'admin')) {
    db.users.push({
      id:           'admin',
      username:     'admin',
      email:        'admin@stylebase.local',
      passwordHash: hashPassword('admin123'),
      role:         'admin',
      createdAt:    Date.now()
    });
    writeDB(db);
    console.log('Администратор создан: admin / admin123');
  }
})();

// ── Вспомогательные функции ────────────────────────────────
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'stylebase_salt').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getSessionUser(req) {
  const token = req.cookies?.session;
  if (!token) return null;
  const db = readDB();
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Необходима авторизация' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getSessionUser(req);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ запрещён' });
  req.user = user;
  next();
}

// ══════════════════════════════════════════════════════════════
//  API routes
// ══════════════════════════════════════════════════════════════

// ── AUTH ───────────────────────────────────────────────────

// Текущий пользователь
app.get('/api/auth/me', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.json({ user: null });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

// Регистрация
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Заполните все поля' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Пароль — минимум 6 символов' });

  const db = readDB();
  if (db.users.find(u => u.username === username))
    return res.status(400).json({ error: 'Логин уже занят' });
  if (db.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email уже используется' });

  const newUser = {
    id:           'u_' + Date.now(),
    username,
    email,
    passwordHash: hashPassword(password),
    role:         'user',
    createdAt:    Date.now()
  };
  db.users.push(newUser);

  const token = generateToken();
  db.sessions[token] = newUser.id;
  writeDB(db);

  res.cookie('session', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
  const { passwordHash, ...safe } = newUser;
  res.json({ user: safe });
});

// Вход
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db   = readDB();
  const user = db.users.find(u =>
    u.username === username && u.passwordHash === hashPassword(password)
  );
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

  const token = generateToken();
  db.sessions[token] = user.id;
  writeDB(db);

  res.cookie('session', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
  const { passwordHash, ...safe } = user;
  res.json({ user: safe });
});

// Выход
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.session;
  if (token) {
    const db = readDB();
    delete db.sessions[token];
    writeDB(db);
  }
  res.clearCookie('session');
  res.json({ ok: true });
});

// ── USERS ──────────────────────────────────────────────────

// Редактирование профиля
app.patch('/api/users/:id', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ запрещён' });

  const { username, email, password } = req.body;
  if (!username || !email)
    return res.status(400).json({ error: 'Логин и email обязательны' });
  if (password && password.length < 6)
    return res.status(400).json({ error: 'Пароль — минимум 6 символов' });

  const db = readDB();
  if (db.users.find(u => u.username === username && u.id !== req.params.id))
    return res.status(400).json({ error: 'Логин уже занят' });
  if (db.users.find(u => u.email === email && u.id !== req.params.id))
    return res.status(400).json({ error: 'Email уже используется' });

  db.users = db.users.map(u => {
    if (u.id !== req.params.id) return u;
    const updated = { ...u, username, email };
    if (password) updated.passwordHash = hashPassword(password);
    return updated;
  });

  // обновляем имя автора во всех стилях
  db.styles = db.styles.map(s =>
    s.authorId === req.params.id ? { ...s, authorName: username } : s
  );
  writeDB(db);
  const updated = db.users.find(u => u.id === req.params.id);
  const { passwordHash, ...safe } = updated;
  res.json({ user: safe });
});

// Удаление пользователя (каскадно удаляет стили)
app.delete('/api/users/:id', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ запрещён' });

  const db = readDB();
  db.users  = db.users.filter(u => u.id !== req.params.id);
  db.styles = db.styles.filter(s => s.authorId !== req.params.id);
  // удаляем все сессии пользователя
  for (const [token, uid] of Object.entries(db.sessions)) {
    if (uid === req.params.id) delete db.sessions[token];
  }
  writeDB(db);

  res.clearCookie('session');
  res.json({ ok: true });
});

// Все пользователи (только для admin)
app.get('/api/users', requireAdmin, (req, res) => {
  const db = readDB();
  const styles = db.styles;
  const result = db.users.map(({ passwordHash, ...u }) => ({
    ...u,
    stylesCount: styles.filter(s => s.authorId === u.id).length,
    downloads:   styles.filter(s => s.authorId === u.id).reduce((a, s) => a + (s.downloads || 0), 0)
  }));
  res.json(result);
});

// ── STYLES ─────────────────────────────────────────────────

// Получить все стили (с фильтрацией)
app.get('/api/styles', (req, res) => {
  const db = readDB();
  res.json(db.styles);
});

// Загрузить новый стиль
app.post('/api/styles', requireAuth, (req, res) => {
  const { name, category, desc, cssContent, fileName, analysis } = req.body;
  if (!name || !cssContent)
    return res.status(400).json({ error: 'Название и CSS обязательны' });

  const db = readDB();
  const newStyle = {
    id:         's_' + Date.now(),
    name,
    category:   category || 'other',
    desc:       desc || '',
    authorId:   req.user.id,
    authorName: req.user.username,
    cssContent,
    fileName:   fileName || name.toLowerCase().replace(/\s+/g, '-') + '.css',
    uploadedAt: Date.now(),
    downloads:  0,
    _analysis:  analysis || null
  };
  db.styles.push(newStyle);
  writeDB(db);
  res.json(newStyle);
});

// Редактировать стиль
app.patch('/api/styles/:id', requireAuth, (req, res) => {
  const db    = readDB();
  const style = db.styles.find(s => s.id === req.params.id);
  if (!style) return res.status(404).json({ error: 'Стиль не найден' });
  if (style.authorId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ запрещён' });

  const { name, category, desc, cssContent, fileName, analysis } = req.body;
  db.styles = db.styles.map(s => {
    if (s.id !== req.params.id) return s;
    const updated = { ...s, name: name||s.name, category: category||s.category, desc: desc||s.desc };
    if (cssContent) { updated.cssContent = cssContent; updated.fileName = fileName||s.fileName; updated._analysis = analysis||s._analysis; }
    return updated;
  });
  writeDB(db);
  res.json(db.styles.find(s => s.id === req.params.id));
});

// Удалить стиль
app.delete('/api/styles/:id', requireAuth, (req, res) => {
  const db    = readDB();
  const style = db.styles.find(s => s.id === req.params.id);
  if (!style) return res.status(404).json({ error: 'Стиль не найден' });
  if (style.authorId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Доступ запрещён' });

  db.styles = db.styles.filter(s => s.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// Скачать стиль (увеличить счётчик)
app.post('/api/styles/:id/download', (req, res) => {
  const db = readDB();
  db.styles = db.styles.map(s =>
    s.id === req.params.id ? { ...s, downloads: (s.downloads || 0) + 1 } : s
  );
  db.totalDownloads = (db.totalDownloads || 0) + 1;
  writeDB(db);
  res.json({ ok: true });
});

// Скачать базовый стиль (только счётчик)
app.post('/api/download/builtin', (req, res) => {
  const db = readDB();
  db.totalDownloads = (db.totalDownloads || 0) + 1;
  writeDB(db);
  res.json({ ok: true });
});

// ── STATS ──────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json({
    stylesCount:   db.styles.length,
    totalDownloads: db.totalDownloads || 0
  });
});

// ── SPA fallback ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`StyleBase запущен: http://localhost:${PORT}`);
});
