import { getUserTransactions, Filters } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { parseTransactionFilters } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filters = parseTransactionFilters(
      Object.fromEntries(searchParams.entries()),
    );

    const transactions = await getUserTransactions(session.user.id, filters);

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expenses;

    return NextResponse.json({
      balance,
      income,
      expenses: Math.abs(expenses),
    });
  } catch (err) {
    console.error("Error in summary:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const filters = parseTransactionFilters(body);

    const transactions = await getUserTransactions(session.user.id, filters);

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income + expenses;

    return NextResponse.json({
      balance,
      income,
      expenses: Math.abs(expenses),
    });
  } catch (err) {
    console.error("Error in summary:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
