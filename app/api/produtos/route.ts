
import { NextResponse } from "next/server";
import pool from "@/lib/db";

type Contexto = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: Request,
  { params }: Contexto
) {
  const client = await pool.connect();

  try {
    const { id } = await params;
    const produtoId = Number(id);

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return NextResponse.json(
        { erro: "ID de produto inválido." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const produto = await client.query(
      "SELECT id, nome FROM produtos WHERE id = $1 FOR UPDATE",
      [produtoId]
    );

    if (produto.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { erro: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // Preserva o histórico de movimentações antes de excluir.
    await client.query(
      "DELETE FROM movimentacoes WHERE produto_id = $1",
      [produtoId]
    );

    await client.query(
      "DELETE FROM produtos WHERE id = $1",
      [produtoId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      mensagem: "Produto excluído com sucesso.",
      produto: produto.rows[0].nome,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao excluir produto:", error);

    return NextResponse.json(
      { erro: "Não foi possível excluir o produto." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
