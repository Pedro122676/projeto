const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de logging para POST e PUT
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && req.body) {
    console.log(`📨 ${req.method} ${req.path}`, req.body);
  }
  next();
});

// ==================== CONEXÃO COM O BANCO ====================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',                    // ← Alterar se você tiver senha no MySQL
  database: 'odontocare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==================== TRATAMENTO DE ERROS ====================
const handleError = (res, err, route = 'Desconhecida') => {
  console.error(`❌ ERRO na rota ${route}:`, err.message);
  if (err.code) console.error(`Código: ${err.code}`);
  if (err.sqlMessage) console.error(`SQL: ${err.sqlMessage}`);

  res.status(500).json({
    success: false,
    error: err.message || 'Erro interno no servidor'
  });
};

// ==================== ROTAS API ====================

// Pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pacientes ORDER BY nome');
    res.json(rows);
  } catch (err) { handleError(res, err, 'GET /api/pacientes'); }
});

app.post('/api/pacientes', async (req, res) => {
  const { nome, cpf, telefone } = req.body;
  try {
    if (!nome || !cpf) return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });

    const [result] = await pool.query(
      'INSERT INTO pacientes (nome, cpf, telefone) VALUES (?, ?, ?)', 
      [nome, cpf, telefone || null]
    );
    res.json({ id: result.insertId, nome, cpf, telefone });
  } catch (err) { handleError(res, err, 'POST /api/pacientes'); }
});

app.put('/api/pacientes/:id', async (req, res) => {
  const { nome, cpf, telefone } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE pacientes SET nome = ?, cpf = ?, telefone = ? WHERE id = ?', 
      [nome, cpf, telefone || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'PUT /api/pacientes/:id'); }
});

app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pacientes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'DELETE /api/pacientes/:id'); }
});

// Consultas
app.get('/api/consultas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM consultas ORDER BY data DESC, hora DESC');
    res.json(rows);
  } catch (err) { handleError(res, err, 'GET /api/consultas'); }
});

app.post('/api/consultas', async (req, res) => {
  const { paciente, dentista, data, hora, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO consultas (paciente, dentista, data, hora, status) VALUES (?, ?, ?, ?, ?)', 
      [paciente, dentista, data, hora, status || 'Agendada']
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) { handleError(res, err, 'POST /api/consultas'); }
});

app.put('/api/consultas/:id', async (req, res) => {
  const { paciente, dentista, data, hora, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE consultas SET paciente = ?, dentista = ?, data = ?, hora = ?, status = ? WHERE id = ?', 
      [paciente, dentista, data, hora, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consulta não encontrada' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'PUT /api/consultas/:id'); }
});

app.delete('/api/consultas/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM consultas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consulta não encontrada' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'DELETE /api/consultas/:id'); }
});

// Dentistas
app.get('/api/dentistas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dentistas ORDER BY nome');
    res.json(rows);
  } catch (err) { handleError(res, err, 'GET /api/dentistas'); }
});

app.post('/api/dentistas', async (req, res) => {
  const { nome, cro, especialidade } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO dentistas (nome, cro, especialidade) VALUES (?, ?, ?)', 
      [nome, cro, especialidade || null]
    );
    res.json({ id: result.insertId, nome, cro, especialidade });
  } catch (err) { handleError(res, err, 'POST /api/dentistas'); }
});

app.put('/api/dentistas/:id', async (req, res) => {
  const { nome, cro, especialidade } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE dentistas SET nome = ?, cro = ?, especialidade = ? WHERE id = ?', 
      [nome, cro, especialidade || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dentista não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'PUT /api/dentistas/:id'); }
});

app.delete('/api/dentistas/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM dentistas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dentista não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'DELETE /api/dentistas/:id'); }
});

// Estoque
app.get('/api/estoque', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estoque ORDER BY nome');
    res.json(rows);
  } catch (err) { handleError(res, err, 'GET /api/estoque'); }
});

app.post('/api/estoque', async (req, res) => {
  const { nome, quantidade, minimo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO estoque (nome, quantidade, minimo) VALUES (?, ?, ?)', 
      [nome, quantidade || 0, minimo || 5]
    );
    res.json({ id: result.insertId, nome, quantidade: quantidade || 0, minimo: minimo || 5 });
  } catch (err) { handleError(res, err, 'POST /api/estoque'); }
});

app.put('/api/estoque/:id', async (req, res) => {
  const { quantidade, minimo } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE estoque SET quantidade = ?, minimo = ? WHERE id = ?', 
      [quantidade, minimo, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'PUT /api/estoque/:id'); }
});

app.delete('/api/estoque/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM estoque WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ success: true });
  } catch (err) { handleError(res, err, 'DELETE /api/estoque/:id'); }
});

// Financeiro
app.get('/api/financeiro', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM financeiro ORDER BY data DESC, id DESC');
    res.json(rows);
  } catch (err) { handleError(res, err, 'GET /api/financeiro'); }
});

app.post('/api/financeiro', async (req, res) => {
  const { tipo, descricao, valor } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO financeiro (tipo, descricao, valor, data) VALUES (?, ?, ?, CURDATE())', 
      [tipo, descricao, valor]
    );
    res.json({ 
      id: result.insertId, 
      tipo, 
      descricao, 
      valor, 
      data: new Date().toISOString().split('T')[0] 
    });
  } catch (err) { handleError(res, err, 'POST /api/financeiro'); }
});

// Estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const [pacientes] = await pool.query('SELECT COUNT(*) as total FROM pacientes');
    const [dentistas] = await pool.query('SELECT COUNT(*) as total FROM dentistas');
    const [consultas] = await pool.query('SELECT COUNT(*) as total FROM consultas');
    const [estoque] = await pool.query('SELECT COUNT(*) as total FROM estoque');

    const [consultasPorStatus] = await pool.query(`
      SELECT status, COUNT(*) as quantidade 
      FROM consultas GROUP BY status
    `);

    const [estoqueBaixo] = await pool.query(`
      SELECT nome, quantidade, minimo 
      FROM estoque WHERE quantidade <= minimo
    `);

    res.json({
      totalPacientes: pacientes[0].total,
      totalDentistas: dentistas[0].total,
      totalConsultas: consultas[0].total,
      totalEstoque: estoque[0].total,
      consultasPorStatus,
      estoqueBaixo
    });
  } catch (err) { handleError(res, err, 'GET /api/stats'); }
});

// ==================== SERVIR ARQUIVOS FRONTEND ====================
app.use(express.static(path.join(__dirname, '../public')));

// Fallback para SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor OdontoCare rodando em http://localhost:${PORT}`);
  console.log(`📁 Frontend servido da pasta: ${path.join(__dirname, '../public')}`);
});

// Para rodar o back
// cd backend
//npm install
//npm run dev