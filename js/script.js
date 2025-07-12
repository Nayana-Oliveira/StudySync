const API_BASE_URL = 'http://localhost:5000/api';
let tasks = [];
let history = [];
let currentTask = null;
let timer = null;
let timerRunning = false;
let timeLeft = 25 * 60;
let timerMode = 'work';
let currentUser = null;

const themeToggle = document.getElementById('themeToggle');
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const taskSelect = document.getElementById('taskSelect');
const timerDisplay = document.getElementById('timerDisplay');
const currentTaskDisplay = document.getElementById('currentTask');
const startTimerBtn = document.getElementById('startTimer');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const progressBar = document.getElementById('progressBar');
const workModeBtn = document.getElementById('workMode');
const breakModeBtn = document.getElementById('breakMode');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const alarmSound = document.getElementById('alarmSound');
const downloadBtn = document.getElementById('downloadBtn');

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem('darkMode', null);
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  themeToggle.addEventListener('click', toggleTheme);
  
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const user = await fetchUserData(token);
      currentUser = user;
      authBtn.innerHTML = '<i class="fas fa-user"></i> Perfil';
      await loadUserData(token);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }
  
  updateTimerDisplay();
  initCharts(); 
  renderHistory();
});

async function initCharts() {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/reports/charts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      createCharts(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados para gráficos:', error);
  }
}

function createCharts(data) {
  if (window.disciplineChart) window.disciplineChart.destroy();
  if (window.productivityChart) window.productivityChart.destroy();
  
  const disciplineCtx = document.getElementById('disciplineChart').getContext('2d');
  window.disciplineChart = new Chart(disciplineCtx, {
    type: 'doughnut',
    data: {
      labels: data.disciplines.map(d => d.discipline),
      datasets: [{
        data: data.disciplines.map(d => d.count),
        backgroundColor: ['#4361ee', '#3f37c9', '#4cc9f0', '#4895ef', '#560bad']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  const productivityCtx = document.getElementById('productivityChart').getContext('2d');
  window.productivityChart = new Chart(productivityCtx, {
    type: 'bar',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Pomodoros Concluídos',
        data: data.productivity,
        backgroundColor: '#4361ee'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}


authBtn.addEventListener('click', () => {
  authModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
  authModal.classList.remove('active');
});

authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.dataset.tab;
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    authForms.forEach(form => {
      form.classList.remove('active');
      if (form.id === `${tabId}Form`) form.classList.add('active');
    });
  });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      currentUser = await fetchUserData(data.token);
      authBtn.innerHTML = '<i class="fas fa-user"></i> Perfil';
      authModal.classList.remove('active');
      showNotification('Login realizado com sucesso!');
      await loadUserData(data.token);
    } else {
      showNotification(data.message || 'Credenciais inválidas', false, 'error');
    }
  } catch (error) {
    showNotification('Erro na conexão', false, 'error');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showNotification('As senhas não coincidem!', false, 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      currentUser = await fetchUserData(data.token);
      authBtn.innerHTML = '<i class="fas fa-user"></i> Perfil';
      authModal.classList.remove('active');
      showNotification('Conta criada com sucesso!');
      await loadUserData(data.token);
    } else {
      showNotification(data.message || 'Erro ao criar conta', false, 'error');
    }
  } catch (error) {
    showNotification('Erro na conexão', false, 'error');
  }
});

async function loadUserData(token) {
  try {
    const tasksResponse = await fetch(`${API_BASE_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (tasksResponse.ok) {
      tasks = await tasksResponse.json();
      renderTasks();
      renderTaskSelect();
    }
    
    const historyResponse = await fetch(`${API_BASE_URL}/pomodoros/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (historyResponse.ok) {
      history = await historyResponse.json();
      renderHistory();
      updateStats();
      initCharts();
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const taskName = document.getElementById('taskName').value;
  const taskDiscipline = document.getElementById('taskDiscipline').value;
  const taskPomodoros = parseInt(document.getElementById('taskPomodoros').value);
  
  if (taskName && taskDiscipline && taskPomodoros) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: taskName,
          discipline: taskDiscipline,
          estimatedPomodoros: taskPomodoros
        })
      });
      
      if (response.ok) {
        const newTask = await response.json();
        tasks.push(newTask);
        renderTasks();
        renderTaskSelect();
        taskForm.reset();
        showNotification('Tarefa adicionada com sucesso!');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Erro ao adicionar tarefa', false, 'error');
      }
    } catch (error) {
      showNotification('Erro na conexão', false, 'error');
    }
  }
});

function renderTasks() {
  tasksList.innerHTML = '';
  const pendingTasks = tasks.filter(t => !t.completed);
  document.getElementById('taskCount').textContent = `${pendingTasks.length} tarefas`;
  
  pendingTasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
      <div class="task-info">
        <div class="task-title">${task.name}</div>
        <div class="task-meta">
          <span class="task-discipline">${task.discipline}</span>
          <span><i class="fas fa-clock"></i> ${task.estimatedPomodoros} pomodoros</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn" onclick="selectTask(${task.id})">
          <i class="fas fa-play"></i>
        </button>
        <button class="action-btn" onclick="editTask(${task.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn" onclick="deleteTask(${task.id})">
          <i class="fas fa-trash"></i>
        </button>
        <button class="action-btn" onclick="completeTask(${task.id})">
          <i class="fas fa-check"></i>
        </button>
      </div>
    `;
    tasksList.appendChild(taskItem);
  });
}

async function completeTask(taskId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        renderTasks();
        renderTaskSelect();
        updateStats();
        
        if (currentTask && currentTask.id === taskId) {
          currentTask = null;
          currentTaskDisplay.textContent = 'Nenhuma tarefa selecionada';
          taskSelect.value = '';
        }
        
        showNotification('Tarefa marcada como concluída!');
      }
    } else {
      const errorData = await response.json();
      showNotification(errorData.message || 'Erro ao completar tarefa', false, 'error');
    }
  } catch (error) {
    showNotification('Erro na conexão', false, 'error');
  }
}

workModeBtn.addEventListener('click', () => {
  timerMode = 'work';
  workModeBtn.classList.add('active');
  breakModeBtn.classList.remove('active');
  timeLeft = 25 * 60;
  updateTimerDisplay();
  resetTimer();
});

breakModeBtn.addEventListener('click', () => {
  timerMode = 'break';
  breakModeBtn.classList.add('active');
  workModeBtn.classList.remove('active');
  timeLeft = 5 * 60;
  updateTimerDisplay();
  resetTimer();
});

startTimerBtn.addEventListener('click', async () => {
  if (!timerRunning) {
    if (!currentTask && timerMode === 'work') {
      showNotification('Selecione uma tarefa para começar!');
      return;
    }
    
    timerRunning = true;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    
    timer = setInterval(async () => {
      timeLeft--;
      updateTimerDisplay();
      
      const totalTime = timerMode === 'work' ? 25 * 60 : 5 * 60;
      const progress = ((totalTime - timeLeft) / totalTime) * 100;
      progressBar.style.width = `${progress}%`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerRunning = false;
        alarmSound.play();
        
        if (timerMode === 'work') {
          try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/pomodoros`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                taskId: currentTask ? currentTask.id : null,
                duration: 25
              })
            });
            
            const historyResponse = await fetch(`${API_BASE_URL}/pomodoros/history`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (historyResponse.ok) {
              history = await historyResponse.json();
              renderHistory();
              updateStats();
              initCharts();
            }
          } catch (error) {
            console.error('Erro ao registrar pomodoro:', error);
          }
          
          timerMode = 'break';
          breakModeBtn.classList.add('active');
          workModeBtn.classList.remove('active');
          timeLeft = 5 * 60;
          updateTimerDisplay();
          showNotification('Tempo de trabalho concluído! Hora de uma pausa.', true);
        } else {
          timerMode = 'work';
          workModeBtn.classList.add('active');
          breakModeBtn.classList.remove('active');
          timeLeft = 25 * 60;
          updateTimerDisplay();
          showNotification('Pausa concluída! Hora de voltar ao trabalho.', true);
        }
        
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        timerDisplay.classList.add('pulse');
        setTimeout(() => timerDisplay.classList.remove('pulse'), 3000);
      }
    }, 1000);
  }
});

async function fetchUserData(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  return null;
}

function showNotification(message, isAlarm = false) {
  notificationMessage.textContent = message;
  notification.style.backgroundColor = isAlarm ? 'var(--warning)' : 'var(--success)';
  notification.classList.add('show');
  
  setTimeout(() => notification.classList.remove('show'), 3000);
}

downloadBtn.addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reports/export`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-studysync.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showNotification('Relatório exportado com sucesso!');
    } else {
      showNotification('Erro ao gerar relatório', false, 'error');
    }
  } catch (error) {
    showNotification('Erro na conexão', false, 'error');
  }
});

window.selectTask = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    currentTask = task;
    currentTaskDisplay.textContent = `${task.discipline} - ${task.name}`;
    taskSelect.value = taskId;
    showNotification(`Tarefa selecionada: ${task.name}`);
  }
};

window.editTask = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDiscipline').value = task.discipline;
    document.getElementById('taskPomodoros').value = task.estimatedPomodoros;
    
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    renderTaskSelect();
    
    showNotification(`Editando tarefa: ${task.name}`);
  }
};

window.deleteTask = function(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  renderTasks();
  renderTaskSelect();
  
  if (currentTask && currentTask.id === taskId) {
    currentTask = null;
    currentTaskDisplay.textContent = 'Nenhuma tarefa selecionada';
    taskSelect.value = '';
  }
  
  showNotification('Tarefa excluída com sucesso!');
};

window.completeTask = completeTask; 

function renderTaskSelect() {
  taskSelect.innerHTML = '<option value="">Selecione uma tarefa</option>';
  
  tasks.filter(task => !task.completed).forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = `${task.discipline} - ${task.name}`;
    taskSelect.appendChild(option);
  });
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (timerMode === 'work') {
    timerDisplay.style.color = 'var(--primary)';
  } else {
    timerDisplay.style.color = 'var(--success)';
  }
}

function resetTimer() {
  clearInterval(timer);
  timerRunning = false;
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  timeLeft = timerMode === 'work' ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
  progressBar.style.width = '0%';
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  
  const recentHistory = [...history].reverse().slice(0, 5);
  
  recentHistory.forEach(item => {
    const task = tasks.find(t => t.id === item.taskId);
    const historyItem = document.createElement('div');
    historyItem.className = 'task-item';
    
    const date = new Date(item.completed_at);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    historyItem.innerHTML = `
      <div class="task-info">
        <div class="task-title">${task ? task.name : 'Sessão de estudo'}</div>
        <div class="task-meta">
          <span class="task-discipline">${task ? task.discipline : 'Geral'}</span>
          <span><i class="fas fa-clock"></i> ${formattedDate}</span>
          <span><i class="fas fa-check-circle"></i> ${item.duration} min</span>
        </div>
      </div>
    `;
    
    historyList.appendChild(historyItem);
  });
}

function updateStats() {
  document.getElementById('completedTasks').textContent = 
    tasks.filter(t => t.completed).length;
    
  document.getElementById('completedPomodoros').textContent = 
    history.filter(h => h.completed).length;
    
  document.getElementById('topDiscipline').textContent = 'Matemática';
  document.getElementById('productiveDay').textContent = 'Segunda';
}