
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, nome, valor, quantidade, categoria FROM produtos ORDER BY id"
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
