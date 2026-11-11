const formFornecedor = document.getElementById('formFornecedor');
const avisoFornecedor = document.getElementById('avisoFornecedor');
const corpoTabelaFornecedores = document.getElementById('corpoTabelaFornecedores');

function lerFormularioFornecedor(formulario) {
  const dados = {};
  const campos = new FormData(formulario);
  campos.forEach(function (valor, chave) {
    dados[chave] = valor;
  });
  return dados;
}

function mostrarAvisoFornecedor(texto, ehErro) {
  if (!avisoFornecedor) return;
  avisoFornecedor.textContent = texto;
  avisoFornecedor.className = ehErro ? 'erro' : '';
}

if (formFornecedor) {
  formFornecedor.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const dados = lerFormularioFornecedor(formFornecedor);

    fetch('/api/fornecedor', {
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
          mostrarAvisoFornecedor(resultado.corpo.erro, true);
          return;
        }
        mostrarAvisoFornecedor('Fornecedor ' + resultado.corpo.id + ' salvo com sucesso.', false);
        formFornecedor.reset();
        carregarFornecedores();
      })
      .catch(function (erro) {
        mostrarAvisoFornecedor('Falha na comunicação: ' + erro.message, true);
      });
  });
}

function carregarFornecedores() {
  if (!corpoTabelaFornecedores) return;

  fetch('/api/fornecedor')
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (lista) {
      desenharTabelaFornecedores(lista);
    })
    .catch(function (erro) {
      mostrarAvisoFornecedor('Falha ao carregar a lista: ' + erro.message, true);
    });
}

function desenharTabelaFornecedores(lista) {
  corpoTabelaFornecedores.innerHTML = '';

  if (lista.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'Nenhum fornecedor cadastrado ainda.';
    tr.appendChild(td);
    corpoTabelaFornecedores.appendChild(tr);
    return;
  }

  lista.forEach(function (item) {
    const tr = document.createElement('tr');
    const colunas = [item.id, item.nome, item.cnpj, item.titulos];

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
      excluirFornecedor(item.id);
    });
    tdBotao.appendChild(botao);
    tr.appendChild(tdBotao);

    corpoTabelaFornecedores.appendChild(tr);
  });
}

function excluirFornecedor(id) {
  fetch('/api/fornecedor/' + id, { method: 'DELETE' })
    .then(function () {
      mostrarAvisoFornecedor('Fornecedor ' + id + ' removido.', false);
      carregarFornecedores();
    })
    .catch(function (erro) {
      mostrarAvisoFornecedor('Falha ao remover: ' + erro.message, true);
    });
}

carregarFornecedores();