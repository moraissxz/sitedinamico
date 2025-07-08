// BACKEND (index.js)
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "ifms_exame",
  password: "postgres",
  port: 5432,
});

function limparNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCep(cep) {
  const numeros = limparNumeros(cep);
  return numeros.length === 8 ? numeros.replace(/(\d{5})(\d{3})/, "$1-$2") : cep;
}

app.post("/api/registrar", async (req, res) => {
  let {
    nome,
    email,
    cpf,
    senha,
    tipoCurso,
    endereco,
    bairro,
    cidade,
    estado,
    cep,
  } = req.body;

  if (
    !nome ||
    !email ||
    !cpf ||
    !senha ||
    !tipoCurso ||
    !endereco ||
    !bairro ||
    !cidade ||
    !estado ||
    !cep
  ) {
    return res.status(400).json({ message: "Campos incompletos." });
  }

  cpf = limparNumeros(cpf);
  cep = formatarCep(cep);

  try {
    const hashSenha = await bcrypt.hash(senha, 10);

    const queryCheck = "SELECT * FROM inscricoes WHERE cpf = $1 OR email = $2";
    const { rowCount } = await pool.query(queryCheck, [cpf, email]);
    if (rowCount > 0) {
      return res.status(400).json({ message: "Usuário já cadastrado." });
    }

    const queryInsert = `
      INSERT INTO inscricoes 
      (nome, email, cpf, senha_hash, tipo_curso, endereco, bairro, cidade, estado, cep) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const result = await pool.query(queryInsert, [
      nome,
      email,
      cpf,
      hashSenha,
      tipoCurso,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
    ]);

    if (result.rowCount > 0) {
      res.status(201).json({ message: "Usuário registrado com sucesso!" });
    } else {
      res.status(500).json({ message: "Erro ao registrar usuário." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: "Preencha e-mail e senha." });
  }

  try {
    const queryUser = "SELECT * FROM inscricoes WHERE email = $1";
    const { rows } = await pool.query(queryUser, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    res.status(200).json({ message: `Login bem-sucedido. Bem-vindo, ${usuario.nome}!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

app.get("/api/inscritos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT nome, email, cpf, tipo_curso, cidade, estado 
      FROM inscricoes 
      ORDER BY nome
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar inscritos:", error);
    res.status(500).json({ message: "Erro ao buscar inscritos" });
  }
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
