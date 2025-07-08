import React, { useState, useEffect } from "react";

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("registro");

  // Estado para dados do formulário de registro
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmacaoSenha: "",
    tipoCurso: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [mensagemRegistro, setMensagemRegistro] = useState("");

  // Estado para login
  const [loginData, setLoginData] = useState({
    email: "",
    senha: "",
  });
  const [mensagemLogin, setMensagemLogin] = useState("");

  // Estado do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Ao montar o componente, verifica se já tem token no localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");
    if (token && nome) {
      setUsuarioLogado({ nome });
    }
  }, []);

  // Funções auxiliares (formatação CPF, CEP, limpar formulários)
  function formatarCPF(valor) {
    const cpf = valor.replace(/\D/g, "").slice(0, 11);
    return cpf
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function formatarCEP(valor) {
    const cep = valor.replace(/\D/g, "").slice(0, 8);
    if (cep.length > 5) {
      return cep.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }
    return cep;
  }

  const limparFormulario = () => {
    setFormData({
      nome: "",
      email: "",
      cpf: "",
      senha: "",
      confirmacaoSenha: "",
      tipoCurso: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    });
  };

  const limparLogin = () => {
    setLoginData({
      email: "",
      senha: "",
    });
  };

  // Registrar usuário
  const handleRegister = async () => {
    const {
      nome,
      email,
      cpf,
      senha,
      confirmacaoSenha,
      tipoCurso,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
    } = formData;
    setMensagemRegistro("");

    if (
      !nome ||
      !email ||
      !cpf ||
      !senha ||
      !confirmacaoSenha ||
      !tipoCurso ||
      !endereco ||
      !bairro ||
      !cidade ||
      !estado ||
      !cep
    ) {
      setMensagemRegistro("Por favor, preencha todos os campos.");
      return;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      setMensagemRegistro("E-mail inválido.");
      return;
    }
    const cpfNumerico = cpf.replace(/\D/g, "");
    if (cpfNumerico.length !== 11) {
      setMensagemRegistro("CPF inválido. Digite 11 números.");
      return;
    }
    if (senha !== confirmacaoSenha) {
      setMensagemRegistro("Senhas não coincidem.");
      return;
    }

    try {
      const res = await fetch("https://ifms-backend-wr34.onrender.com/api/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          cpf: cpfNumerico,
          senha,
          tipoCurso,
          endereco,
          bairro,
          cidade,
          estado,
          cep,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagemRegistro("Erro ao registrar: " + (data.error || data.message));
      } else {
        setMensagemRegistro(data.message);
        limparFormulario();
      }
    } catch (error) {
      setMensagemRegistro("Erro na requisição: " + error.message);
    }
  };

  // Login usuário
  const handleLogin = async () => {
    setMensagemLogin("");
    const { email, senha } = loginData;
    if (!email || !senha) {
      setMensagemLogin("Preencha e-mail e senha para entrar.");
      return;
    }

    try {
      const res = await fetch("https://ifms-backend-wr34.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagemLogin("Erro no login: " + data.message);
      } else {
        setMensagemLogin(data.message);
        limparLogin();

        // Salvar token e nome no localStorage para manter login após recarregar
        if (data.token && data.nome) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("nome", data.nome);
          setUsuarioLogado({ nome: data.nome });
        }
      }
    } catch (error) {
      setMensagemLogin("Erro na requisição: " + error.message);
    }
  };

  // Logout (limpa estado e localStorage)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    setUsuarioLogado(null);
    setMensagemLogin("");
    setMensagemRegistro("");
    setAbaAtiva("login");
  };

  return (
    <>
      <header style={styles.header}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Instituto_Federal_de_Mato_Grosso_do_Sul_-_Marca_Vertical_2015.svg"
          alt="Logo IFMS"
          style={styles.logo}
        />
        <h1 style={styles.headerTitle}>Inscrição para Exame de Ingresso - IFMS</h1>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {usuarioLogado ? (
            // Mostra área logada
            <section style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "700", fontSize: 18 }}>
                Olá, {usuarioLogado.nome}! Você está logado.
              </p>
              <button onClick={handleLogout} style={styles.button}>
                Sair
              </button>
            </section>
          ) : (
            <>
              <nav style={styles.tabs}>
                <button
                  onClick={() => setAbaAtiva("registro")}
                  style={{
                    ...styles.tabButton,
                    ...(abaAtiva === "registro" ? styles.tabActive : {}),
                  }}
                  aria-label="Aba Cadastro"
                >
                  Cadastro
                </button>
                <button
                  onClick={() => setAbaAtiva("login")}
                  style={{
                    ...styles.tabButton,
                    ...(abaAtiva === "login" ? styles.tabActive : {}),
                  }}
                  aria-label="Aba Login"
                >
                  Login
                </button>
              </nav>

              {abaAtiva === "registro" && (
                <section style={styles.section}>
                  <input
                    placeholder="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="E-mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: formatarCPF(e.target.value) })
                    }
                    maxLength={14}
                    style={styles.input}
                  />

                  <select
                    value={formData.tipoCurso}
                    onChange={(e) => setFormData({ ...formData, tipoCurso: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Selecione o tipo de curso</option>
                    <option value="Tecnico Eletronica">Técnico em Eletrônica</option>
                    <option value="Tecnico Informatica">Técnico em Informática</option>
                  </select>

                  <input
                    placeholder="Endereço (Rua, Número)"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="CEP"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: formatarCEP(e.target.value) })
                    }
                    maxLength={9}
                    style={styles.input}
                  />

                  <input
                    placeholder="Senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Confirmar Senha"
                    type="password"
                    value={formData.confirmacaoSenha}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmacaoSenha: e.target.value })
                    }
                    style={styles.input}
                  />
                  <button onClick={handleRegister} style={styles.button}>
                    Registrar
                  </button>
                  {mensagemRegistro && (
                    <p
                      style={{
                        ...styles.message,
                        color: mensagemRegistro.includes("sucesso") ? "#00512D" : "#D32F2F",
                      }}
                      role="alert"
                    >
                      {mensagemRegistro}
                    </p>
                  )}
                </section>
              )}

              {abaAtiva === "login" && (
                <section style={styles.section}>
                  <input
                    placeholder="E-mail"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Senha"
                    type="password"
                    value={loginData.senha}
                    onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                    style={styles.input}
                  />
                  <button onClick={handleLogin} style={styles.button}>
                    Entrar
                  </button>
                  {mensagemLogin && (
                    <p
                      style={{
                        ...styles.message,
                        color: mensagemLogin.includes("bem-sucedido") ? "#00512D" : "#D32F2F",
                      }}
                      role="alert"
                    >
                      {mensagemLogin}
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

const styles = {
  header: {
    backgroundColor: "#00512D",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    color: "#fff",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
  },
  logo: {
    height: 60,
    width: "auto",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    margin: 0,
    color: "#D9EAD3",
  },
  main: {
    minHeight: "calc(100vh - 92px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F3",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 36,
    borderRadius: 10,
    width: 420,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  tabs: {
    display: "flex",
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    padding: 14,
    cursor: "pointer",
    backgroundColor: "#D9EAD3",
    border: "none",
    borderBottom: "3px solid transparent",
    fontWeight: "600",
    fontSize: 17,
    transition: "background-color 0.3s, border-color 0.3s",
    borderRadius: "5px 5px 0 0",
    marginRight: 6,
    color: "#003E20",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderBottom: "3px solid #00512D",
    fontWeight: "700",
    color: "#00512D",
  },
  section: {},
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 18,
    borderRadius: 5,
    border: "1.5px solid #B0C8A8",
    fontSize: 17,
    boxSizing: "border-box",
    outlineColor: "#71B54B",
    transition: "outline-color 0.3s",
    color: "#003E20",
  },
  button: {
    width: "100%",
    padding: 16,
    backgroundColor: "#00512D",
    border: "none",
    borderRadius: 6,
    color: "#D9EAD3",
    fontWeight: "700",
    fontSize: 17,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  message: {
    marginTop: 16,
    fontWeight: "600",
    textAlign: "center",
  },
};

const styles = {
  header: {
    backgroundColor: "#4CAF50", // cor atualizada
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column", // altera de linha para coluna
    alignItems: "center", // centraliza horizontalmente
    gap: 12,
    color: "#fff",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
  },
  logo: {
    height: 60,
    width: "auto",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    margin: 0,
    color: "#FFFFFF", // branco fica legível com o verde claro
    textAlign: "center",
  },
  main: {
    minHeight: "calc(100vh - 92px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F3",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 36,
    borderRadius: 10,
    width: 420,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  tabs: {
    display: "flex",
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    padding: 14,
    cursor: "pointer",
    backgroundColor: "#C8E6C9", // verde bem claro
    border: "none",
    borderBottom: "3px solid transparent",
    fontWeight: "600",
    fontSize: 17,
    transition: "background-color 0.3s, border-color 0.3s",
    borderRadius: "5px 5px 0 0",
    marginRight: 6,
    color: "#2E7D32",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderBottom: "3px solid #388E3C",
    fontWeight: "700",
    color: "#388E3C",
  },
  section: {},
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 18,
    borderRadius: 5,
    border: "1.5px solid #A5D6A7",
    fontSize: 17,
    boxSizing: "border-box",
    outlineColor: "#66BB6A",
    color: "#2E7D32",
  },
  button: {
    width: "100%",
    padding: 16,
    backgroundColor: "#388E3C",
    border: "none",
    borderRadius: 6,
    color: "#E8F5E9",
    fontWeight: "700",
    fontSize: 17,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  message: {
    marginTop: 16,
    fontWeight: "600",
    textAlign: "center",
  },
};

