import { getUserTransactions } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { FileTypes } from "@/lib/types";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";

function getTextColor(hex: string) {
  const color = hex.replace("#", "");

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // luminance formula (perceived brightness)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? "000000" : "FFFFFF";
}

export function buildStyledWorkbook(
  data: any[],
  colors: string[]
) {
  const PRIMARY = (colors[0] || "4F46E5").replace("#", "");
  const MUTED = (colors[1] || "F3F4F6").replace("#", "");
  const EXPENSE = (colors[2] || "EF4444").replace("#", "");

  const header = ["Amount", "Type", "Category", "Description", "Created At"];

  const worksheetData = [
    header,
    ...data.map((tx) => [
      tx.amount,
      tx.type,
      tx.category?.name || "Uncategorized",
      tx.description || "",
      tx.createdAt.toISOString(),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // =========================
  // 1. HEADER
  // =========================
  for (let c = 0; c < header.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c });

    ws[cell].s = {
      fill: { fgColor: { rgb: PRIMARY } },
      font: {
        color: { rgb: getTextColor(PRIMARY) },
        bold: true,
      },
    };
  }

  // =========================
  // 2. BODY BASE STYLE (muted)
  // =========================
  for (let r = 1; r < worksheetData.length; r++) {
    for (let c = 0; c < header.length; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });

      ws[cell] = ws[cell] || {};
      ws[cell].s = {
        fill: { fgColor: { rgb: MUTED } },
        font: { color: { rgb: "111827" } },
      };
    }
  }

  // =========================
  // 3. TYPE COLUMN (income / expense)
  // =========================
  for (let r = 1; r < worksheetData.length; r++) {
    const tx = data[r - 1];

    const bg = (tx.type === "income" ? PRIMARY : EXPENSE);
    const text = getTextColor(bg);

    const cell = XLSX.utils.encode_cell({ r, c: 1 });

    ws[cell].s = {
      fill: { fgColor: { rgb: bg } },
      font: {
        color: { rgb: text },
        bold: true,
      },
    };
  }

  // =========================
  // 4. CATEGORY COLUMN (DB COLOR)
  // =========================
  for (let r = 1; r < worksheetData.length; r++) {
    const tx = data[r - 1];

    const bg = (tx.category?.color || MUTED).replace("#", "");
    const text = getTextColor(bg);

    const cell = XLSX.utils.encode_cell({ r, c: 2 });

    ws[cell].s = {
      fill: { fgColor: { rgb: bg } },
      font: {
        color: { rgb: text },
        bold: true,
      },
    };
  }

  // =========================
  // 5. AUTO COLUMN WIDTHS
  // =========================
  ws["!cols"] = header.map((_, i) => {
    const max = Math.max(
      ...worksheetData.map((row) =>
        row[i] ? String(row[i]).length : 10
      )
    );

    return { wch: max + 2 };
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
    const body = await req.json();
    const colors = (body.colors as string | null)?.split(":") || [];
    const type = (body.type as string)?.toLowerCase() as FileTypes;

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
