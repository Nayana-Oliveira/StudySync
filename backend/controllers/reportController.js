const Pomodoro = require('../models/Pomodoro');

exports.getChartsData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [disciplines] = await db.execute(`
      SELECT t.discipline, COUNT(*) AS count 
      FROM pomodoros p
      JOIN tasks t ON p.task_id = t.id
      WHERE p.user_id = ?
      GROUP BY t.discipline
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);
    
    const [productivity] = await db.execute(`
      SELECT 
        DAYOFWEEK(p.completed_at) AS day,
        COUNT(*) AS count
      FROM pomodoros p
      WHERE p.user_id = ? 
        AND p.completed_at >= CURDATE() - INTERVAL 7 DAY
      GROUP BY DAYOFWEEK(p.completed_at)
      ORDER BY day
    `, [userId]);
    
    const productivityData = Array(7).fill(0);
    productivity.forEach(item => {
      const index = (item.day === 1) ? 6 : item.day - 2;
      productivityData[index] = item.count;
    });
    
    res.json({
      disciplines,
      productivity: productivityData
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados para gráficos:', error);
    res.status(500).json({ message: 'Erro ao gerar dados para gráficos' });
  }
};