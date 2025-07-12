const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { name, discipline, estimatedPomodoros } = req.body;
    const taskId = await Task.create({
      userId: req.user.id,
      name,
      discipline,
      estimatedPomodoros
    });
    
    res.status(201).json({ id: taskId, name, discipline, estimatedPomodoros });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa' });
  }
};