const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();
const cors = require("cors");


const app = express();
const port = 3000;

// Middleware para processar JSON e dados codificados em URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Ativa o CORS
// Middleware para verificar se o usuário é admin
function isAdmin(req, res, next) {
    const { privilegio } = req.body; // Assumindo que o privilégio vem do body ou da sessão

    if (privilegio !== "admin") {
        return res.status(403).json({ error: "Acesso negado. Privilegios insuficientes." });
    }
    next();
}



// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Testar conexão com o banco de dados
db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log("Conectado ao banco de dados MySQL!");
    }
});

/////////////////////////
// Endpoints de Usuários
/////////////////////////

// Criar um novo usuário
app.post("/usuarios", (req, res) => {
    const { nome, email, senha, telefone, endereco, privilegio } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
    }

    const query = `
        INSERT INTO usuarios (nome, email, senha, telefone, endereco, privilegio)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [nome, email, senha, telefone, endereco, privilegio || "cliente"], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: "Usuário criado com sucesso!", id: result.insertId });
        }
    });
});

// Listar todos os usuários
app.get("/usuarios", (req, res) => {
    const query = "SELECT * FROM usuarios";
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Obter um usuário pelo ID
app.get("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM usuarios WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ error: "Usuário não encontrado." });
        } else {
            res.json(results[0]);
        }
    });
});

// Atualizar um usuário
app.put("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, telefone, endereco, privilegio } = req.body;

    const query = `
        UPDATE usuarios
        SET nome = ?, email = ?, senha = ?, telefone = ?, endereco = ?, privilegio = ?
        WHERE id = ?
    `;
    db.query(query, [nome, email, senha, telefone, endereco, privilegio, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "Usuário não encontrado." });
        } else {
            res.json({ message: "Usuário atualizado com sucesso!" });
        }
    });
});

// Deletar um usuário
app.delete("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM usuarios WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "Usuário não encontrado." });
        } else {
            res.json({ message: "Usuário deletado com sucesso!" });
        }
    });
});

app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    }

    const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    db.query(query, [usuario, senha], (err, results) => {
        if (err) {
            console.error("Erro no banco de dados:", err);
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha inválidos." });
        }

        // Simulação de geração de token 
        const token = "token-ficticio"; 
        res.json({
            message: "Login realizado com sucesso!",
            token,
            user: results[0], 
        });
    });
});

/////////////////////////
// Endpoints de Produtos
/////////////////////////

// Criar um novo produto
app.post("/admin/produtos", isAdmin, (req, res) => {
    const { nome, descricao, preco, estoque, imagem, categoriaid } = req.body;

    if (!nome || !preco || !estoque || !categoriaid) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
    }

    const query = `
        INSERT INTO produtos (nome, descricao, preco, estoque, imagem, categoriaid)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [nome, descricao, preco, estoque, imagem, categoriaid], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: "Produto criado com sucesso!", id: result.insertId });
        }
    });
});


// Listar todos os produtos
app.get("/produtos", (req, res) => {
    const query = "SELECT * FROM produtos";
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Obter um produto pelo ID
app.get("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM produtos WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ error: "Produto não encontrado." });
        } else {
            res.json(results[0]);
        }
    });
});

// Atualizar um produto
app.put("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, imagem, categoriaid } = req.body;

    const query = `
        UPDATE produtos
        SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagem = ?, categoriaid = ?
        WHERE id = ?
    `;
    db.query(query, [nome, descricao, preco, estoque, imagem, categoriaid, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "Produto não encontrado." });
        } else {
            res.json({ message: "Produto atualizado com sucesso!" });
        }
    });
});

// Deletar um produto
app.delete("/admin/produtos/:id", isAdmin, (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM produtos WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "Produto não encontrado." });
        } else {
            res.json({ message: "Produto deletado com sucesso!" });
        }
    });
});


/////////////////////////
// Outros Endpoints (Categorias, Pedidos, ItensPedido)
// Siga o mesmo padrão das rotas anteriores para adicionar endpoints para essas tabelas.
/////////////////////////

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
