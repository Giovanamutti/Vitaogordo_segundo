var sqlite3 = require('sqlite3');
var path = require('path');

var caminho = path.join(__dirname, 'banco.db');
var db = new sqlite3.Database(caminho);

db.serialize(function () {
  db.run('PRAGMA foreign_keys = ON');

  // Tabela Cliente
  db.run(`
    CREATE TABLE IF NOT EXISTS cliente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      nascimento TEXT NOT NULL,
      cep TEXT NOT NULL
    )
  `);

  // Tabela Fornecedor
  db.run(`
    CREATE TABLE IF NOT EXISTS fornecedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT NOT NULL UNIQUE,
      titulos TEXT NOT NULL 
    )
  `);

  // Tabela Obras
  db.run(`
    CREATE TABLE IF NOT EXISTS obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      numero_de_paginas TEXT NOT NULL,
      editora TEXT NOT NULL
    )
  `);

  // Tabela Obra-Fornecedor
  db.run(`
    CREATE TABLE IF NOT EXISTS obra_fornecedor (
      fornecedor_id INTEGER NOT NULL,
      obras_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (fornecedor_id, obras_id),
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE CASCADE,
      FOREIGN KEY (obras_id) REFERENCES obras(id)
    )
  `);

  // Tabela Movimento
  db.run(`
    CREATE TABLE IF NOT EXISTS movimento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      movimento_data TEXT NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    )
  `);

  // Tabela Item Movimento
  db.run(`
    CREATE TABLE IF NOT EXISTS item_movimento (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      movimento_id INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      movimento_data TEXT NOT NULL, 
      movimento_tipo TEXT NOT NULL,    
      movimento_venda_data TEXT, 
      movimento_retorno_data TEXT, 
      movimento_devolucao_data TEXT, 
      movimento_valor NUMERIC NOT NULL,   
      FOREIGN KEY (movimento_id) REFERENCES movimento(id),
      FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    )
  `);

  // Tabela Caixa
  db.run(`
    CREATE TABLE IF NOT EXISTS caixa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movimento_id INTEGER NOT NULL,
      caixa_valor NUMERIC NOT NULL, 
      caixa_data TEXT,
      FOREIGN KEY (movimento_id) REFERENCES movimento(id)
    )
  `);
});

module.exports = db;