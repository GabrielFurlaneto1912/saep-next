
"use client";

import { useEffect, useState } from "react";

type Produto = {
  id: number;
  nome: string;
  valor: number;
  quantidade: number;
  categoria: string;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch("/api/produtos");
        
        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os produtos.");
        }

        const dados: Produto[] = await resposta.json();
        setProdutos(dados);
      } catch {
        setErro("Não foi possível carregar os produtos do banco.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  const quantidadeTotal = produtos.reduce(
    (total, produto) => total + produto.quantidade,
    0
  );

  const valorTotal = produtos.reduce(
    (total, produto) => total + produto.valor * produto.quantidade,
    0
  );

  const moeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <main className="pagina">
      <aside className="menu">
        <h2>SAEP<span>.</span></h2>
        <p className="menu-legenda">GESTÃO DE ESTOQUE</p>

        <nav>
          <a className="ativo" href="#inicio">▦ Visão geral</a>
          <a href="#produtos">▤ Produtos</a>
          <a href="#movimentacoes">⇄ Movimentações</a>
          <a href="#relatorios">▥ Relatórios</a>
        </nav>

        <div className="menu-rodape">
          <div className="avatar">SA</div>
          <div>
            <strong>Administrador</strong>
            <small>Sistema SAEP</small>
          </div>
        </div>
      </aside>

      <section className="conteudo" id="inicio">
        <header className="topo">
          <div>
            <p className="sobretitulo">PAINEL DE CONTROLE</p>
            <h1>Visão geral</h1>
            <p className="subtitulo">
              Bem-vindo! Confira o resumo do seu estoque.
            </p>
          </div>

          <span className="status">● Sistema conectado</span>
        </header>

        <section className="indicadores">
          <article className="cartao">
            <div className="icone azul">▤</div>
            <p>Produtos cadastrados</p>
            <h2>{carregando ? "..." : produtos.length}</h2>
            <small>Itens no catálogo</small>
          </article>

          <article className="cartao">
            <div className="icone verde">▦</div>
            <p>Unidades em estoque</p>
            <h2>{carregando ? "..." : quantidadeTotal}</h2>
            <small>Soma das quantidades</small>
          </article>

          <article className="cartao">
            <div className="icone roxo">R$</div>
            <p>Valor do estoque</p>
            <h2>{carregando ? "..." : moeda(valorTotal)}</h2>
            <small>Valor estimado dos produtos</small>
          </article>
        </section>

        <section className="painel" id="produtos">
          <div className="painel-topo">
            <div>
              <h2>Produtos em estoque</h2>
              <p>Dados carregados do MySQL.</p>
            </div>

            <span className="contador">
              {produtos.length} produtos
            </span>
          </div>

          {carregando ? (
            <p style={{ padding: 24 }}>Carregando produtos...</p>
          ) : erro ? (
            <p style={{ padding: 24, color: "red" }}>{erro}</p>
          ) : produtos.length === 0 ? (
            <p style={{ padding: 24 }}>Nenhum produto cadastrado.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>PRODUTO</th>
                    <th>CATEGORIA</th>
                    <th>VALOR UNITÁRIO</th>
                    <th>QUANTIDADE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td><strong>{produto.nome}</strong></td>
                      <td>{produto.categoria}</td>
                      <td>{moeda(Number(produto.valor))}</td>
                      <td>{produto.quantidade} un.</td>
                      <td>
                        <span className="etiqueta">
                          {produto.quantidade > 0
                            ? "Disponível"
                            : "Sem estoque"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="aviso" id="movimentacoes">
          <div className="aviso-icone">i</div>
          <div>
            <strong>Estoque conectado ao banco de dados</strong>
            <p>
              Os produtos e os indicadores desta tela são carregados
              pela API conectada ao MySQL.
            </p>
          </div>
        </section>

        <footer id="relatorios">
          SAEP · Sistema de Controle de Estoque
        </footer>
      </section>
    </main>
  );
}
