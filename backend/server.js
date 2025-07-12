require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

db.execute('SELECT 1')
  .then(() => console.log('✅ Conectado ao MySQL!'))
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('API StudySync funcionando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});