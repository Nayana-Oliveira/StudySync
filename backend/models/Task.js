const db = require('../config/db');

class Task {
  static async create({ userId, name, discipline, estimatedPomodoros }) {
    const [result] = await db.execute(
      'INSERT INTO tasks (user_id, name, discipline, estimated_pomodoros) VALUES (?, ?, ?, ?)',
      [userId, name, discipline, estimatedPomodoros]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE user_id = ?', [userId]);
    return rows;
  }
}