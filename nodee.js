// 1. INSTALAR AS PARADAS PRIMEIRO:
// npm install pg

// 2. ARQUIVO: conectar.js
const { Client } = require('pg');

// Seus dados do banco (mude aqui)
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'carros',
  user: 'postgres',
  password: 'postgres'
});

// Conectar no banco
client.connect()
  .then(() => console.log('Conectou no banco!'))
  .catch(err => console.log('Erro:', err));

// ===================================================
// CRUD = Create (criar), Read (ler), Update (editar), Delete (apagar)

// CRIAR PESSOA
async function criarPessoa(nome, email) {
  const sql = `INSERT INTO pessoas (nome, email) VALUES ('${nome}', '${email}') RETURNING *`;
  const resultado = await client.query(sql);
  console.log('Pessoa criada:', resultado.rows[0]);
  return resultado.rows[0];
}

// VER TODAS AS PESSOAS  
async function verTodasPessoas() {
  const sql = 'SELECT * FROM pessoas';
  const resultado = await client.query(sql);
  console.log('Todas as pessoas:', resultado.rows);
  return resultado.rows;
}

// VER UMA PESSOA POR ID
async function verUmaPessoa(id) {
  const sql = `SELECT * FROM pessoas WHERE id = ${id}`;
  const resultado = await client.query(sql);
  console.log('Pessoa encontrada:', resultado.rows[0]);
  return resultado.rows[0];
}

// EDITAR PESSOA
async function editarPessoa(id, novoNome, novoEmail) {
  const sql = `UPDATE pessoas SET nome = '${novoNome}', email = '${novoEmail}' WHERE id = ${id} RETURNING *`;
  const resultado = await client.query(sql);
  console.log('Pessoa editada:', resultado.rows[0]);
  return resultado.rows[0];
}

// APAGAR PESSOA
async function apagarPessoa(id) {
  const sql = `DELETE FROM pessoas WHERE id = ${id} RETURNING *`;
  const resultado = await client.query(sql);
  console.log('Pessoa apagada:', resultado.rows[0]);
  return resultado.rows[0];
}

// ===================================================
// TESTANDO TUDO (exemplo de uso)

async function testar() {
  console.log('Testando o CRUD...\n');

  // 1. Criar uma pessoa
  await criarPessoa('JoÃ£o', 'joao@email.com');

  // 2. Ver todas as pessoas
  await verTodasPessoas();

  // 3. Ver uma pessoa especÃ­fica (ID 1)
  await verUmaPessoa(1);

  // 4. Editar a pessoa
  await editarPessoa(1, 'JoÃ£o Silva', 'joao.silva@email.com');

  // 5. Apagar a pessoa
  await apagarPessoa(1);




  await criarPessoa('Ana', 'ana@tii.com');

  let pessoas = await verTodasPessoas();
  for (let p of pessoas) {
    console.log(`ID: ${p.id}, Nome: ${p.nome}, Email: ${p.email}`);
  }



  // Fechar conexÃ£o
  client.end();
  console.log('Desconectou do banco');
}

// Executar o teste
testar();
