
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Produto = {
  id: number;
  nome: string;
  valor: number | string;
  quantidade: number;
  categoria: string;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("");
  const [produtoSaida, setProdutoSaida] = useState("");
  const [quantidadeSaida, setQuantidadeSaida] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregarProdutos = useCallback(async () => {
    try {
      const resposta = await fetch("/api/produtos");
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao carregar produtos.");
      }

      setProdutos(dados);
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os produtos."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  async function cadastrarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    const valorNumerico = Number(valor);
    const quantidadeNumerica = Number(quantidade);

    if (
      !nome.trim() ||
      !categoria.trim() ||
      valor === "" ||
      quantidade === "" ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0 ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica < 0
    ) {
      setMensagem("Preencha todos os campos corretamente.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          valor: valorNumerico,
          quantidade: quantidadeNumerica,
          categoria: categoria.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível cadastrar.");
      }

      setMensagem("Produto cadastrado com sucesso!");
      setNome("");
      setValor("");
      setQuantidade("");
      setCategoria("");

      await carregarProdutos();
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function registrarSaida(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    const id = Number(produtoSaida);
    const quantidadeNumerica = Number(quantidadeSaida);
    const produto = produtos.find((item) => item.id === id);

    if (
      !produto ||
      !Number.isInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      setMensagem("Selecione um produto e informe uma quantidade válida.");
      return;
    }

    if (quantidadeNumerica > produto.quantidade) {
      setMensagem(
        `Estoque insuficiente. Disponível: ${produto.quantidade} unidade(s).`
      );
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/produtos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto_id: id,
          quantidade: quantidadeNumerica,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível registrar a saída.");
      }

      setMensagem(
        `Saída registrada! Estoque de ${dados.nome}: ${dados.quantidade} unidade(s).`
      );
      setProdutoSaida("");
      setQuantidadeSaida("");

      await carregarProdutos();
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao registrar a saída."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja realmente excluir "${produto.nome}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    setMensagem("");

    try {
      const resposta = await fetch(`/api/produtos/${produto.id}`, {
        method: "DELETE",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível excluir o produto.");
      }

      setMensagem(`Produto "${produto.nome}" excluído com sucesso!`);
      await carregarProdutos();
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao excluir o produto."
      );
    }
  }

  const formatarMoeda = (preco: number | string) =>
    Number(preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Sistema de controle de estoque
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            SAEP — Gestão de Produtos
          </h1>
          <p className="mt-2 text-slate-600">
            Cadastre produtos, acompanhe o estoque e registre saídas.
          </p>
        </header>

        {mensagem && (
          <p
            role="status"
            aria-live="polite"
            className="mb-6 rounded-lg bg-white p-4 shadow-sm"
          >
            {mensagem}
          </p>
        )}

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Cadastrar produto</h2>

          <form
            onSubmit={cadastrarProduto}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label htmlFor="nome" className="mb-1 block text-sm font-medium">
                Nome do produto
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Barbante"
                maxLength={150}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="categoria"
                className="mb-1 block text-sm font-medium"
              >
                Categoria
              </label>
              <input
                id="categoria"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                placeholder="Ex.: Artesanato"
                maxLength={100}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="valor" className="mb-1 block text-sm font-medium">
                Valor (R$)
              </label>
              <input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                placeholder="15.50"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="quantidade"
                className="mb-1 block text-sm font-medium"
              >
                Quantidade inicial
              </label>
              <input
                id="quantidade"
                type="number"
                min="0"
                step="1"
                value={quantidade}
                onChange={(event) => setQuantidade(event.target.value)}
                placeholder="20"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Cadastrar produto"}
              </button>
            </div>
          </form>
        </section>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Registrar saída</h2>

          <form
            onSubmit={registrarSaida}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="produtoSaida"
                className="mb-1 block text-sm font-medium"
              >
                Produto
              </label>
              <select
                id="produtoSaida"
                value={produtoSaida}
                onChange={(event) => setProdutoSaida(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} — estoque: {produto.quantidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quantidadeSaida"
                className="mb-1 block text-sm font-medium"
              >
                Quantidade a retirar
              </label>
              <input
                id="quantidadeSaida"
                type="number"
                min="1"
                step="1"
                value={quantidadeSaida}
                onChange={(event) => setQuantidadeSaida(event.target.value)}
                required
                placeholder="Ex.: 2"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {salvando ? "Processando..." : "Registrar saída"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Produtos cadastrados</h2>
            <button
              type="button"
              onClick={carregarProdutos}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Atualizar lista
            </button>
          </div>

          {carregando ? (
            <p className="py-6 text-slate-600">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p className="py-6 text-slate-600">Nenhum produto cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Produto</th>
                    <th className="px-3 py-3">Categoria</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3">Quantidade</th>
                    <th className="px-3 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4">{produto.id}</td>
                      <td className="px-3 py-4 font-medium">{produto.nome}</td>
                      <td className="px-3 py-4">{produto.categoria}</td>
                      <td className="px-3 py-4">
                        {formatarMoeda(produto.valor)}
                      </td>
                      <td className="px-3 py-4">{produto.quantidade}</td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => excluirProduto(produto)}
                          className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

