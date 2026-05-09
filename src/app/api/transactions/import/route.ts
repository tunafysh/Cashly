import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  createTransaction,
  TransactionInput,
  transactionSchema,
} from "@/db/queries/transactions";
import { auth } from "@/lib/auth";

const parseCsv = (file: File): Promise<TransactionInput[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        resolve(results.data as TransactionInput[]);
      },

      error: (error) => {
        reject(error);
      },
    });
  });
};

type FileTypes = "json" | "csv" | "xlsx";
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const searchParams = new URL(req.url).searchParams;
    const type: FileTypes = (searchParams.get("type") as FileTypes) || "json";

    if (!file) {
      return NextResponse.json(
        { message: "File parameter is required" },
        { status: 400 },
      );
    }

    let data: unknown[] = [];

    if (type === "csv") {
      data = await parseCsv(file);
    } else if (type === "xlsx") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(worksheet);
    } else {
      const text = await file.text();
      data = JSON.parse(text);
    }

    // Add userId to each transaction
    const transactions = (data as Record<string, unknown>[]).map((item) => ({
      ...item,
      userId,
    })) as TransactionInput[];

    // Validate all transactions
    const validatedTransactions = transactionSchema.array().parse(transactions);

    // Create all transactions in bulk
    await createTransaction(validatedTransactions);

    return NextResponse.json(
      {
        message: "Transactions imported successfully",
        count: validatedTransactions.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error importing transactions:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}