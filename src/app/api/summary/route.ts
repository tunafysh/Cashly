import { getUserTransactions, Filters } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function parseFilters(body: any): Filters {
  return {
    fromDate: body.fromDate ? new Date(body.fromDate) : undefined,
    toDate: body.toDate ? new Date(body.toDate) : undefined,
    categoryId: body.categoryId,
    type: body.type,
    withDescription: body.withDescription,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();

    const filters = parseFilters(body);

    const transactions = await getUserTransactions(userId, filters);

    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income + expenses;

    return NextResponse.json({
      filters,
      balance,
      income,
      expenses: Math.abs(expenses),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}