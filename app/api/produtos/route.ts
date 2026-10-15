
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nome, valor, quantidade, categoria
       FROM produtos
       ORDER BY id DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

    return NextResponse.json(
      { erro: "Não foi possível consultar os produtos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const nome = String(body.nome ?? "").trim();
    const categoria = String(body.categoria ?? "").trim();
    const valor = Number(body.valor);
    const quantidade = Number(body.quantidade);

    if (
      !nome ||
      !categoria ||
      body.valor === "" ||
      body.quantidade === "" ||
      !Number.isFinite(valor) ||
      !Number.isInteger(quantidade) ||
      valor < 0 ||
      quantidade < 0
    ) {
      return NextResponse.json(
        { erro: "Preencha todos os campos com valores válidos." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO produtos (nome, valor, quantidade, categoria)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, valor, quantidade, categoria`,
      [nome, valor, quantidade, categoria]
    );

    const produto = result.rows[0];

    if (quantidade > 0) {
      await client.query(
        `INSERT INTO movimentacoes
         (produto_id, tipo, quantidade)
         VALUES ($1, 'entrada', $2)`,
        [produto.id, quantidade]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar produto:", error);

    return NextResponse.json(
      { erro: "Não foi possível cadastrar o produto." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const produtoId = Number(body.produto_id);
    const quantidade = Number(body.quantidade);

    if (
      !Number.isInteger(produtoId) ||
      produtoId <= 0 ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      return NextResponse.json(
        { erro: "Informe um produto e uma quantidade válida para a saída." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE produtos
       SET quantidade = quantidade - $1
       WHERE id = $2 AND quantidade >= $1
       RETURNING id, nome, valor, quantidade, categoria`,
      [quantidade, produtoId]
    );

    if (result.rowCount === 0) {
      const existe = await client.query(
        "SELECT id FROM produtos WHERE id = $1",
        [produtoId]
      );

      await client.query("ROLLBACK");

      if (existe.rowCount === 0) {
        return NextResponse.json(
          { erro: "Produto não encontrado." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { erro: "Estoque insuficiente para essa saída." },
        { status: 400 }
      );
    }

    await client.query(
      `INSERT INTO movimentacoes
       (produto_id, tipo, quantidade)
       VALUES ($1, 'saida', $2)`,
      [produtoId, quantidade]
    );

    await client.query("COMMIT");

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao registrar saída:", error);

    return NextResponse.json(
      { erro: "Não foi possível registrar a saída." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
