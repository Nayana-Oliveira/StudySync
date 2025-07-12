const db = require('../config/db');

class Pomodoro {
  static async create({ userId, taskId, duration }) {
    const [result] = await db.execute(
      'INSERT INTO pomodoros (user_id, task_id, duration) VALUES (?, ?, ?)',
      [userId, taskId, duration]
    );
    return result.insertId;
  }

  static async getHistory(userId) {
    const [rows] = await db.execute(
      `SELECT p.*, t.name AS task_name, t.discipline 
       FROM pomodoros p
       LEFT JOIN tasks t ON p.task_id = t.id
       WHERE p.user_id = ?`,
      [userId]
    );
    return rows;
  }

}