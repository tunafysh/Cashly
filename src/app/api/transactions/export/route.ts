import { getUserTransactions } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { FileTypes } from "@/lib/types";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";

export function buildStyledWorkbook(data: any[], colors: string[]) {
  const header = [
    "Amount",
    "Type",
    "Category",
    "Description",
    "Created At",
  ];

  const rows = data.map((tx) => [
    tx.amount,
    tx.type,
    tx.category?.name || "Uncategorized",
    tx.description || "",
    tx.createdAt.toISOString(),
  ]);

  // 📦 Add totals row
  const totalIncome = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const worksheetData = [
    header,
    ...rows,
    ["", "TOTAL INCOME", totalIncome, "", ""],
    ["", "TOTAL EXPENSE", totalExpense, "", ""],
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // 🎨 Theme colors (match your UI)
  const PRIMARY = colors[0] || "2563EB"; // default to blue if no color provided
  const MUTED = colors[1] || "6B7280"; // default to gray if no color provided

  // =========================
  // 1. HEADER STYLE
  // =========================
  for (let c = 0; c < header.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c });

    ws[cell].s = {
      fill: { bgColor: { rgb: PRIMARY } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
    };
  }

  // =========================
  // 2. BODY ROWS (zebra + category color)
  // =========================
  for (let r = 1; r <= data.length; r++) {
  const tx = data[r - 1];

  const categoryColor = tx.category?.color || MUTED;

  const cell = XLSX.utils.encode_cell({ r, c: 2 });

  ws[cell] = ws[cell] || {};

  ws[cell].s = {
    fill: {
      bgColor: { rgb: categoryColor.replace("#", "") },
    },
    font: {
      color: { rgb: "FFFFFF" },
      bold: true,
    },
  };
}

  // =========================
  // 3. TOTAL ROW STYLING
  // =========================
  const totalStartRow = rows.length + 1;

  for (let c = 0; c < header.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: totalStartRow, c });

    ws[cell].s = {
      fill: { bgColor: { rgb: MUTED } }, // dark
      font: { color: { rgb: "FFFFFF" }, bold: true },
    };
  }

  for (let c = 0; c < header.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: totalStartRow + 1, c });

    ws[cell].s = {
      fill: { fgColor: { rgb: "111827" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
    };
  }

  // =========================
  // 4. AUTO COLUMN WIDTHS
  // =========================
  ws["!cols"] = header.map((_, i) => {
    const maxLength = Math.max(
      ...worksheetData.map((row) =>
        row[i] ? String(row[i]).length : 10,
      ),
    );

    return { wch: maxLength + 2 };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  return wb;
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const colors = (formData.get("colors") as string | null)?.split(":") || [];
    const type = (formData.get("type") as string)?.toLowerCase() as FileTypes;

    if (!type || !["json", "csv", "xlsx"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid or missing 'type' parameter" },
        { status: 400 },
      );
    }

    let data = await getUserTransactions(session.user.id);

    if (type === "json") {
      return NextResponse.json(data);
    } else if (type === "csv") {
      const csvContent = [
        ["Amount", "Type", "Category", "Description", "Created At"],
        ...data.map((tx) => [
          tx.amount,
          tx.type,
          tx.category?.name || "",
          tx.description || "",
          tx.createdAt.toISOString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="transactions.csv"',
        },
      });
    } else if (type === "xlsx") {
      const workbook = buildStyledWorkbook(data, colors);
      const xlsxContent = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });

      return new Response(xlsxContent, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="transactions.xlsx"',
        },
      });
    }

  } catch (error) {
    console.error("Error processing file upload:", error);
    return NextResponse.json(
      { message: "Error processing file upload" },
      { status: 500 },
    );
  }

}
