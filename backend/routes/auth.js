const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/registrar', async (req, res) => {
  const { nome, email, cpf, senha } = req.body;
  if (!nome || !email || !cpf || !senha) return res.status(400).json({ message: 'Campos obrigatórios.' });

  const hash = await bcrypt.hash(senha, 10);
  try {
    await pool.query('INSERT INTO inscricoes (nome, email, cpf, senha_hash) VALUES ($1, $2, $3, $4)', [nome, email, cpf, hash]);
    res.json({ message: 'Usuário registrado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const result = await pool.query('SELECT * FROM inscricoes WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });

  const valid = await bcrypt.compare(senha, user.senha_hash);
  if (!valid) return res.status(401).json({ message: 'Senha incorreta.' });

  res.json({ message: 'Login realizado com sucesso.' });
});

module.exports = router;