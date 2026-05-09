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
    const type = (formData.get("type") as string)?.toLowerCase() as FileTypes;
    if (!file) {
      return NextResponse.json(
        { message: "File parameter is required" },
        { status: 400 },
      );
    }

    let data: PrimitiveTransaction[] = [];

    // Parse file
    if (type === "csv") {
      data = await parseCsv(file);
    } else if (type === "xlsx") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      data = XLSX.utils.sheet_to_json(sheet) as PrimitiveTransaction[];
    } else {
      const text = await file.text();
      data = JSON.parse(text);
    }

    // Validate + collect categories
    const categorySet = new Set<string>();

    for (const item of data) {
      if (
        item.amount === undefined ||
        item.amount === null ||
        !item.type ||
        !item.category
      ) {
        return NextResponse.json(
          {
            message: "Each transaction must have amount, type, and category",
            invalidItem: item,
          },
          { status: 400 },
        );
      }

      categorySet.add(item.category.trim());
    }

    // Create categories
    const createdCategories = await createCategoryWithoutColor(
      [...categorySet].map((name) => ({
        userId,
        name: name.trim(),
      })),
    );

    // Build lookup map
    const categoryMap = new Map(createdCategories.map((c) => [c.name, c.id]));

    // Normalize transactions
    const transactions: TransactionInput[] = data.map((item) => {
      const categoryId = categoryMap.get(item.category.trim());

      if (!categoryId) {
        throw new Error(`Category mapping failed for: ${item.category}`);
      }

      return {
        userId,
        amount: Number(item.amount),
        type: item.type,
        description: item.description,
        categoryId,
      };
    });

    // Validate
    const validatedTransactions = transactionSchema.array().parse(transactions);

    // Insert
    await createTransaction(validatedTransactions);

    return NextResponse.json({
      message: "Transactions imported successfully",
      count: validatedTransactions.length,
    });
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
