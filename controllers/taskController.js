const db = require('../config/db');

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function getTasks(req, res, next) {
  try {
    const { status } = req.query;
    let tasks;

    if (status && VALID_STATUSES.includes(status)) {
      tasks = db.prepare(
        'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC'
      ).all(req.user.id, status);
    } else {
      tasks = db.prepare(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
      ).all(req.user.id);
    }

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

function getTaskById(req, res, next) {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

function createTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const finalStatus = VALID_STATUSES.includes(status) ? status : 'pending';
    const finalPriority = VALID_PRIORITIES.includes(priority) ? priority : 'medium';

    const result = db.prepare(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id,
      title.trim(),
      description || '',
      finalStatus,
      finalPriority,
      due_date || null
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (err) {
    next(err);
  }
}

function updateTask(req, res, next) {
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, description, status, priority, due_date } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    db.prepare(
      `UPDATE tasks SET
        title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    ).run(
      title !== undefined && title.trim() ? title.trim() : existing.title,
      description !== undefined ? description : existing.description,
      status || existing.status,
      priority || existing.priority,
      due_date !== undefined ? due_date : existing.due_date,
      req.params.id,
      req.user.id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json({ message: 'Task updated', task: updated });
  } catch (err) {
    next(err);
  }
}

function deleteTask(req, res, next) {
  try {
    const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
