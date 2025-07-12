<h1 align="center"> StudySync - Organizador de Estudos Pomodoro </h1> 
![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)

StudySync é uma aplicação web completa para gerenciamento de estudos baseada na técnica Pomodoro.

O StudySync é uma aplicação web integrada que combina a técnica Pomodoro com gestão de tarefas acadêmicas. Ele permite que estudantes criem tarefas organizadas por disciplina, definam sessões de estudo cronometradas e acompanhem seu progresso através de relatórios visuais. Com seu timer inteligente, o sistema alterna automaticamente entre períodos de foco intenso (25 minutos) e pausas estratégicas (5 minutos), registrando cada ciclo concluído para análise posterior.

![Dashboard do StydySync]<img width="1349" height="643" alt="readme" src="https://github.com/user-attachments/assets/d873cfa8-9f42-41fd-b7b1-586c99ee7821" />


## Recursos Principais

- **Autenticação de Usuário**: Cadastro e login seguro
- **Gestão de Tarefas**: Crie, edite e acompanhe tarefas por disciplina
- **Timer Pomodoro**: Sessões de estudo e pausas cronometradas
- **Relatórios e Estatísticas**: Gráficos de produtividade e histórico
- **Tema Claro/Escuro**: Interface personalizável
- **Disciplinas Mais Estudadas**: Visualização de dados de estudo
- **Notificações**: Alertas visuais para ações importantes

## Tecnologias Utilizadas

### Frontend

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização com variáveis, flexbox e grid
- **JavaScript**: Lógica da aplicação
- **Chart.js**: Visualização de gráficos
- **Font Awesome**: Ícones

### Backend

- **Node.js**: Ambiente de execução
- **Express.js**: Framework web
- **MySQL 8.0**: Banco de dados relacional
- **JWT**: Autenticação por tokens
- **Bcrypt**: Criptografia de senhas

### Ferramentas

- **Git**: Controle de versão
- **npm**: Gerenciamento de pacotes
- **dotenv**: Gerenciamento de variáveis de ambiente

## Como Executar Localmente

### Pré-requisitos

- Node.js v18+
- MySQL 8.0+
- npm v9+

### Configuração do Banco de Dados

1. Acesse o MySQL:
mysql -u root -p

1.1 Execute os comandos SQL:

CREATE DATABASE study_sync;
USE study_sync;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  discipline VARCHAR(100) NOT NULL,
  estimated_pomodoros INT NOT NULL DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE pomodoros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT,
  duration INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

### Configuração do Backend

1. Navegue até a pasta do backend:
cd backend


1.1 Instale as dependências:
npm install

1.2 Crie um arquivo `.env` com:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=study_sync
PORT=5000
JWT_SECRET=seu_secreto_jwt

1.3 Inicie o servidor:
npm start

### Configuração do Frontend

1.4 Navegue até a pasta do frontend:
cd frontend

1.5 Abra o arquivo `js/script.js` e verifique:
const API_BASE_URL = '<http://localhost:5000/api>';

1.6. Sirva os arquivos estáticos:
npx serve

1.7 Acesse no navegador:
<http://localhost:3000>

## Endpoints da API

### Autenticação
- POST /api/auth/register - Registrar novo usuário
- POST /api/auth/login - Fazer login

### Tarefas

- GET /api/tasks - Listar tarefas do usuário
- POST /api/tasks - Criar nova tarefa
- PATCH /api/tasks/:id/complete - Marcar tarefa como concluída

### Pomodoros

- POST /api/pomodoros - Registrar novo pomodoro
- GET /api/pomodoros/history - Obter histórico de pomodoros

### Relatórios

- GET /api/reports/charts - Obter dados para gráficos
- GET /api/reports/export - Exportar relatório em PDF

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](https://www.notion.so/LICENSE) para detalhes.

## Contato

Desenvolvedor: Nayana Heslley Barbosa Oliveira
Email: nayanaheslley123@gmail.com
LinkedIn: https://www.linkedin.com/in/nayana-oliveira/
