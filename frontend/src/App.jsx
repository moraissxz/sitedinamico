import React, { useState, useEffect } from "react";

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("registro");

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

  const [loginData, setLoginData] = useState({
    email: "",
    senha: "",
  });
  const [mensagemLogin, setMensagemLogin] = useState("");

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");
    if (token && nome) {
      setUsuarioLogado({ nome });
    }
  }, []);

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
                >
                  Cadastro
                </button>
                <button
                  onClick={() => setAbaAtiva("login")}
                  style={{
                    ...styles.tabButton,
                    ...(abaAtiva === "login" ? styles.tabActive : {}),
                  }}
                >
                  Login
                </button>
              </nav>

              {abaAtiva === "registro" && (
                <section style={styles.section}>
                  {/* ...todos os inputs... */}
                  <input
                    placeholder="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    style={styles.input}
                  />
                  {/* ...outros campos seguem igual... */}
                  <button onClick={handleRegister} style={styles.button}>
                    Registrar
                  </button>
                  {mensagemRegistro && (
                    <p
                      style={{
                        ...styles.message,
                        color: mensagemRegistro.includes("sucesso") ? "#2E7D32" : "#D32F2F",
                      }}
                    >
                      {mensagemRegistro}
                    </p>
                  )}
                </section>
              )}

              {abaAtiva === "login" && (
                <section style={styles.section}>
                  {/* ...campos de login... */}
                  <button onClick={handleLogin} style={styles.button}>
                    Entrar
                  </button>
                  {mensagemLogin && (
                    <p
                      style={{
                        ...styles.message,
                        color: mensagemLogin.includes("sucesso") ? "#2E7D32" : "#D32F2F",
                      }}
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
    backgroundColor: "#4CAF50",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    color: "#FFFFFF",
    textAlign: "center",
  },
  main: {
    minHeight: "calc(100vh - 120px)",
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
    backgroundColor: "#C8E6C9",
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
