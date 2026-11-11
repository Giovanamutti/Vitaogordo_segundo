var http = require('http');
var fs = require('fs');
var path = require('path');
var db = require('./db');

var PORTA = 7600;

function responderJson(res, status, conteudo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(conteudo));
}

var TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

function servirArquivo(res, caminhoRelativo) {
  var caminho = path.join(__dirname, 'public', caminhoRelativo);

  if (!fs.existsSync(caminho)) {
    caminho = path.join(__dirname, caminhoRelativo);
  }

  if (!fs.existsSync(caminho)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Arquivo nao encontrado: ' + caminhoRelativo);
  }

  var tipo = TIPOS[path.extname(caminho)] || 'text/plain; charset=utf-8';
  res.writeHead(200, { 'Content-Type': tipo });
  res.end(fs.readFileSync(caminho));
}

var servidor = http.createServer(function (req, res) {
  var caminho = req.url.split('?')[0];

  // ==================== ROTAS CLIENTE ====================
  if (req.method === 'GET' && caminho === '/api/cliente') {
    db.all('SELECT * FROM cliente ORDER BY id DESC', [], function (erro, linhas) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      responderJson(res, 200, linhas || []);
    });
    return;
  }

  if (req.method === 'POST' && caminho === '/api/cliente') {
    var texto = '';
    req.on('data', function (pedaco) { texto += pedaco; });
    req.on('end', function () {
      var novo;
      try { novo = JSON.parse(texto); } catch (erro) { return responderJson(res, 400, { erro: 'Dados invalidos.' }); }

      if (!novo.nome || !novo.cpf || !novo.cep) {
        return responderJson(res, 400, { erro: 'CEP, nome e CPF sao obrigatorios.' });
      }

      var sql = 'INSERT INTO cliente (nome, telefone, cpf, nascimento, cep) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [novo.nome, novo.telefone || '', novo.cpf, novo.nascimento || '', novo.cep], function (erro) {
        if (erro) {
          if (erro.message.indexOf('UNIQUE') !== -1) return responderJson(res, 400, { erro: 'CPF ja cadastrado.' });
          return responderJson(res, 500, { erro: erro.message });
        }
        novo.id = this.lastID;
        responderJson(res, 201, novo);
      });
    });
    return;
  }

  if (req.method === 'DELETE' && caminho.indexOf('/api/cliente/') === 0) {
    var idCliente = caminho.split('/')[3];
    db.run('DELETE FROM cliente WHERE id = ?', [idCliente], function (erro) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      if (this.changes === 0) return responderJson(res, 404, { erro: 'Cliente nao encontrado.' });
      responderJson(res, 200, { removido: Number(idCliente) });
    });
    return;
  }

  // ==================== ROTAS FORNECEDOR ====================
  if (req.method === 'GET' && caminho === '/api/fornecedor') {
    db.all('SELECT * FROM fornecedor ORDER BY id DESC', [], function (erro, linhas) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      responderJson(res, 200, linhas || []);
    });
    return;
  }

  if (req.method === 'POST' && caminho === '/api/fornecedor') {
    var textoFornecedor = '';
    req.on('data', function (pedaco) { textoFornecedor += pedaco; });
    req.on('end', function () {
      var novo;
      try { novo = JSON.parse(textoFornecedor); } catch (erro) { return responderJson(res, 400, { erro: 'Dados invalidos.' }); }

      if (!novo.nome || !novo.cnpj || !novo.titulos) {
        return responderJson(res, 400, { erro: 'Nome, CNPJ e titulos sao obrigatorios.' });
      }

      var sql = 'INSERT INTO fornecedor (nome, cnpj, titulos) VALUES (?, ?, ?)';
      db.run(sql, [novo.nome, novo.cnpj, novo.titulos], function (erro) {
        if (erro) {
          if (erro.message.indexOf('UNIQUE') !== -1) return responderJson(res, 400, { erro: 'CNPJ ja cadastrado.' });
          return responderJson(res, 500, { erro: erro.message });
        }
        novo.id = this.lastID;
        responderJson(res, 201, novo);
      });
    });
    return;
  }

  if (req.method === 'DELETE' && caminho.indexOf('/api/fornecedor/') === 0) {
    var idFornecedor = caminho.split('/')[3];
    db.run('DELETE FROM fornecedor WHERE id = ?', [idFornecedor], function (erro) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      if (this.changes === 0) return responderJson(res, 404, { erro: 'Fornecedor nao encontrado.' });
      responderJson(res, 200, { removido: Number(idFornecedor) });
    });
    return;
  }

  // ==================== ROTAS OBRAS ====================
  if (req.method === 'GET' && caminho === '/api/obras') {
    db.all('SELECT * FROM obras ORDER BY id DESC', [], function (erro, linhas) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      responderJson(res, 200, linhas || []);
    });
    return;
  }

  if (req.method === 'POST' && caminho === '/api/obras') {
    var textoObra = '';
    req.on('data', function (pedaco) { textoObra += pedaco; });
    req.on('end', function () {
      var novo;
      try { novo = JSON.parse(textoObra); } catch (erro) { return responderJson(res, 400, { erro: 'Dados invalidos.' }); }

      if (!novo.nome || !novo.categoria || !novo.editora) {
        return responderJson(res, 400, { erro: 'Nome, categoria e editora sao obrigatorios.' });
      }

      var sql = 'INSERT INTO obras (nome, categoria, numero_de_paginas, editora) VALUES (?, ?, ?, ?)';
      db.run(sql, [novo.nome, novo.categoria, novo.numero_de_paginas || '0', novo.editora], function (erro) {
        if (erro) return responderJson(res, 500, { erro: erro.message });
        novo.id = this.lastID;
        responderJson(res, 201, novo);
      });
    });
    return;
  }

  if (req.method === 'DELETE' && caminho.indexOf('/api/obras/') === 0) {
    var idObra = caminho.split('/')[3];
    db.run('DELETE FROM obras WHERE id = ?', [idObra], function (erro) {
      if (erro) return responderJson(res, 500, { erro: erro.message });
      if (this.changes === 0) return responderJson(res, 404, { erro: 'Obra nao encontrada.' });
      responderJson(res, 200, { removido: Number(idObra) });
    });
    return;
  }

  // ---- Arquivos estáticos ----
  if (req.method === 'GET') {
    var arquivoParaServir = caminho === '/' ? 'index.html' : caminho;
    return servirArquivo(res, arquivoParaServir);
  }

  responderJson(res, 404, { erro: 'Nao encontrado.' });
});

servidor.listen(PORTA, function () {
  console.log('Pronto! Servidor rodando em http://localhost:' + PORTA);
});