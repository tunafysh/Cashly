import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  createTransaction,
  TransactionInput,
  transactionSchema,
} from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { createCategoryWithoutColor } from "@/db/queries/categories";

const parseCsv = (file: File): Promise<PrimitiveTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        resolve(results.data as PrimitiveTransaction[]);
      },

      error: (error) => {
        reject(error);
      },
    });
  });
};

// Define the expected structure of the transaction data to further normalize it
type PrimitiveTransaction = {
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
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

    let data: PrimitiveTransaction[] = [];

    
    if (type === "csv") {
      data = await parseCsv(file);
    } else if (type === "xlsx") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(worksheet) as PrimitiveTransaction[];
    } else {
      const text = await file.text();
      data = JSON.parse(text);
    }

    let categories = new Set<string>();

    for (const item of data) {
      if (!item.amount || !item.type || !item.category) {
        return NextResponse.json(
          {
            message: "Each transaction must have amount, type, and category",
            invalidItem: item,
          },
          { status: 400 },
        );
      }
      categories.add(item.category);
    }

    for (const category of categories) {
      await createCategoryWithoutColor({
        userId,
        name: category,
      });
    } // the color is generated randomly in the function.

    // Add userId to each transaction
    const transactions = (data as Record<string, unknown>[]).map((item) => ({
      ...item,
      userId,
    })) as TransactionInput[];

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