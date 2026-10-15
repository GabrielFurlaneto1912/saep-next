
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
        headers: {
          "Content-Type": "application/json",
        },
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
            Cadastre produtos e acompanhe as quantidades disponíveis.
          </p>
        </header>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Cadastrar produto</h2>

          <form
            onSubmit={cadastrarProduto}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="nome"
                className="mb-1 block text-sm font-medium"
              >
                Nome do produto
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Barbante"
                maxLength={150}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="valor"
                className="mb-1 block text-sm font-medium"
              >
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="quantidade"
                className="mb-1 block text-sm font-medium"
              >
                Quantidade em estoque
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Cadastrando..." : "Cadastrar produto"}
              </button>
            </div>
          </form>

          {mensagem && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 rounded-lg bg-slate-100 p-3 text-sm"
            >
              {mensagem}
            </p>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Produtos cadastrados</h2>
            <button
              type="button"
              onClick={carregarProdutos}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Atualizar lista
            </button>
          </div>

          {carregando ? (
            <p className="py-6 text-slate-600">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p className="py-6 text-slate-600">
              Nenhum produto cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Produto</th>
                    <th className="px-3 py-3">Categoria</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4">{produto.id}</td>
                      <td className="px-3 py-4 font-medium">
                        {produto.nome}
                      </td>
                      <td className="px-3 py-4">{produto.categoria}</td>
                      <td className="px-3 py-4">
                        {formatarMoeda(produto.valor)}
                      </td>
                      <td className="px-3 py-4">{produto.quantidade}</td>
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
