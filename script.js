const API_URL = "http://localhost:3000"; // URL base do backend

// Elementos HTML
const output = document.getElementById("output");
const viewUsersButton = document.getElementById("view-users");
const viewProductsButton = document.getElementById("view-products");
const createUserButton = document.getElementById("create-user");
const createProductButton = document.getElementById("create-product");

// Funções de Utilidade
async function fetchAPI(endpoint, method = "GET", body = null) {
    try {
        const options = {
            method,
            headers: { "Content-Type": "application/json" },
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_URL}/${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error("Erro na API:", error);
        return { error: "Erro ao se conectar com o servidor." };
    }
}

function renderOutput(content) {
    output.innerHTML = content;
}

// Handlers de Botões
viewUsersButton.addEventListener("click", async () => {
    const users = await fetchAPI("usuarios");
    if (users.error) {
        renderOutput(`<p>${users.error}</p>`);
    } else {
        renderOutput(
            `<h2>Usuários</h2>` +
            users.map((user) => `
                <p><strong>${user.nome}</strong> (${user.email})</p>
            `).join("")
        );
    }
});

viewProductsButton.addEventListener("click", async () => {
    const products = await fetchAPI("produtos");
    if (products.error) {
        renderOutput(`<p>${products.error}</p>`);
    } else {
        renderOutput(
            `<h2>Produtos</h2>` +
            products.map((product) => `
                <p><strong>${product.nome}</strong>: R$${product.preco.toFixed(2)}</p>
            `).join("")
        );
    }
});

createUserButton.addEventListener("click", () => {
    const form = `
        <h2>Criar Usuário</h2>
        <form id="user-form">
            <label>Nome: <input type="text" id="user-name" required></label><br>
            <label>Email: <input type="email" id="user-email" required></label><br>
            <label>Senha: <input type="password" id="user-password" required></label><br>
            <label>Telefone: <input type="text" id="user-phone"></label><br>
            <label>Endereço: <input type="text" id="user-address"></label><br>
            <button type="submit">Enviar</button>
        </form>
    `;
    renderOutput(form);

    document.getElementById("user-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = document.getElementById("user-name").value;
        const email = document.getElementById("user-email").value;
        const senha = document.getElementById("user-password").value;
        const telefone = document.getElementById("user-phone").value;
        const endereco = document.getElementById("user-address").value;

        const result = await fetchAPI("usuarios", "POST", { nome, email, senha, telefone, endereco });
        if (result.error) {
            renderOutput(`<p>${result.error}</p>`);
        } else {
            renderOutput(`<p>Usuário criado com sucesso! ID: ${result.id}</p>`);
        }
    });
});

createProductButton.addEventListener("click", () => {
    const form = `
        <h2>Criar Produto</h2>
        <form id="product-form">
            <label>Nome: <input type="text" id="product-name" required></label><br>
            <label>Descrição: <input type="text" id="product-description"></label><br>
            <label>Preço: <input type="number" id="product-price" required></label><br>
            <label>Estoque: <input type="number" id="product-stock" required></label><br>
            <label>Imagem: <input type="text" id="product-image"></label><br>
            <label>Categoria ID: <input type="number" id="product-category-id" required></label><br>
            <button type="submit">Enviar</button>
        </form>
    `;
    renderOutput(form);

    document.getElementById("product-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nome = document.getElementById("product-name").value;
        const descricao = document.getElementById("product-description").value;
        const preco = parseFloat(document.getElementById("product-price").value);
        const estoque = parseInt(document.getElementById("product-stock").value, 10);
        const imagem = document.getElementById("product-image").value;
        const categoriaid = parseInt(document.getElementById("product-category-id").value, 10);

        const result = await fetchAPI("produtos", "POST", { nome, descricao, preco, estoque, imagem, categoriaid });
        if (result.error) {
            renderOutput(`<p>${result.error}</p>`);
        } else {
            renderOutput(`<p>Produto criado com sucesso! ID: ${result.id}</p>`);
        }
    });
});
