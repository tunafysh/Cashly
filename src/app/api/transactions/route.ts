import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserTransactions, createTransaction, deleteTransaction } from "@/db/queries/transactions";

type CreateTransactionInput = {
  userId: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: string;
  description?: string;
};

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      fromDate: searchParams.get("fromDate")
        ? new Date(searchParams.get("fromDate")!)
        : undefined,

      toDate: searchParams.get("toDate")
        ? new Date(searchParams.get("toDate")!)
        : undefined,

      categoryId: searchParams.get("categoryId") ?? undefined,

      type: searchParams.get("type") as
        | "income"
        | "expense"
        | undefined,

      withDescription:
        searchParams.get("withDescription") === "true",
    };

    console.log("Parsed filters:", filters);

    const transactions = await getUserTransactions(
      session.user.id,
      filters
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

    try {
        const { amount, type, categoryId, description } = await req.json();

        const transaction = await createTransaction({
            userId: session.user.id,
            amount,
            type,
            categoryId,
            description,
        });

        return NextResponse.json({ transaction });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
          { message: "Internal Server Error" },
          { status: 500 },
        );
    }
}

// No UPDATE function since transactions are immutable.

export async function DELETE(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        await deleteTransaction(session.user.id, id);
        return NextResponse.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json(
          { message: "Internal Server Error" },
          { status: 500 },
        );
    }
}