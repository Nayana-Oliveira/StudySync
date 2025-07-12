const Pomodoro = require('../models/Pomodoro');

exports.recordPomodoro = async (req, res) => {
  try {
    const { taskId, startTime, endTime, duration } = req.body;
    
    const newPomodoro = new Pomodoro({
      userId: req.user.id,
      taskId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration
    });

    await newPomodoro.save();
    
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, { 
        $inc: { completedPomodoros: 1 }
      });
    }
    
    res.json(newPomodoro);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};