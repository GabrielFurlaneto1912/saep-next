
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

    const result = await pool.query(
      `INSERT INTO produtos (nome, valor, quantidade, categoria)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, valor, quantidade, categoria`,
      [nome, valor, quantidade, categoria]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);

    return NextResponse.json(
      { erro: "Não foi possível cadastrar o produto." },
      { status: 500 }
    );
  }
}
