const formObras = document.getElementById('formObras');
const avisoObras = document.getElementById('avisoObras');
const corpoTabelaObras = document.getElementById('corpoTabelaObras');

function lerFormularioObras(formulario) {
  const dados = {};
  const campos = new FormData(formulario);
  campos.forEach(function (valor, chave) {
    dados[chave] = valor;
  });
  return dados;
}

function mostrarAvisoObras(texto, ehErro) {
  if (!avisoObras) return;
  avisoObras.textContent = texto;
  avisoObras.className = ehErro ? 'erro' : '';
}

if (formObras) {
  formObras.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const dados = lerFormularioObras(formObras);

    fetch('/api/obras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(function (resposta) {
        return resposta.json().then(function (corpo) {
          return { ok: resposta.ok, corpo: corpo };
        });
      })
      .then(function (resultado) {
        if (!resultado.ok) {
          mostrarAvisoObras(resultado.corpo.erro, true);
          return;
        }
        mostrarAvisoObras('Obra ' + resultado.corpo.id + ' salva com sucesso.', false);
        formObras.reset();
        carregarObras();
      })
      .catch(function (erro) {
        mostrarAvisoObras('Falha na comunicação: ' + erro.message, true);
      });
  });
}

function carregarObras() {
  if (!corpoTabelaObras) return;

  fetch('/api/obras')
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (lista) {
      desenharTabelaObras(lista);
    })
    .catch(function (erro) {
      mostrarAvisoObras('Falha ao carregar a lista: ' + erro.message, true);
    });
}

function desenharTabelaObras(lista) {
  corpoTabelaObras.innerHTML = '';

  if (lista.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Nenhuma obra cadastrada ainda.';
    tr.appendChild(td);
    corpoTabelaObras.appendChild(tr);
    return;
  }

  lista.forEach(function (obra) {
    const tr = document.createElement('tr');
    const colunas = [obra.id, obra.nome, obra.categoria, obra.numero_de_paginas, obra.editora];

    colunas.forEach(function (valor) {
      const td = document.createElement('td');
      td.textContent = (valor === null ? '' : valor);
      tr.appendChild(td);
    });

    const tdBotao = document.createElement('td');
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = 'Excluir';
    botao.addEventListener('click', function () {
      excluirObra(obra.id);
    });
    tdBotao.appendChild(botao);
    tr.appendChild(tdBotao);

    corpoTabelaObras.appendChild(tr);
  });
}

function excluirObra(id) {
  fetch('/api/obras/' + id, { method: 'DELETE' })
    .then(function () {
      mostrarAvisoObras('Obra ' + id + ' removida.', false);
      carregarObras();
    })
    .catch(function (erro) {
      mostrarAvisoObras('Falha ao remover: ' + erro.message, true);
    });
}

carregarObras();