import { getUserTransactions } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { FileTypes } from "@/lib/types";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style"; // must use xlsx-js-style, not plain xlsx

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns "FFFFFF" or "000000" depending on which contrasts better with bg. */
function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Perceived luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "000000" : "FFFFFF";
}

function solidFill(rgb: string) {
  // patternType: "solid" is REQUIRED — Excel silently ignores fills without it
  return { patternType: "solid", fgColor: { rgb } };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function buildStyledWorkbook(data: any[], colors: string[]) {
  const PRIMARY = (colors[0] || "4F46E5").replace("#", "");
  const MUTED   = (colors[1] || "F3F4F6").replace("#", "");
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

  // ── 1. HEADER ────────────────────────────────────────────────────────────
  for (let c = 0; c < header.length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    ws[addr].s = {
      fill: solidFill(PRIMARY),
      font: { color: { rgb: getTextColor(PRIMARY) }, bold: true },
    };
  }

  // ── 2. BODY BASE STYLE ───────────────────────────────────────────────────
  for (let r = 1; r < worksheetData.length; r++) {
    for (let c = 0; c < header.length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      // aoa_to_sheet skips empty strings — initialise the cell if absent
      if (!ws[addr]) {
        ws[addr] = { t: "z", v: "" };
      }
      ws[addr].s = {
        fill: solidFill(MUTED),
        font: { color: { rgb: getTextColor(MUTED) } },
      };
    }
  }

  // ── 3. TYPE COLUMN ───────────────────────────────────────────────────────
  for (let r = 1; r < worksheetData.length; r++) {
    const tx   = data[r - 1];
    const bg   = tx.type === "income" ? PRIMARY : EXPENSE;
    const addr = XLSX.utils.encode_cell({ r, c: 1 });
    ws[addr].s = {
      fill: solidFill(bg),
      font: { color: { rgb: getTextColor(bg) }, bold: true },
    };
  }

  // ── 4. CATEGORY COLUMN ───────────────────────────────────────────────────
  for (let r = 1; r < worksheetData.length; r++) {
    if (!data[r - 1].category?.color) continue; // skip uncategorized
    const tx   = data[r - 1];
    const bg   = (tx.category?.color || MUTED).replace("#", "");
    const addr = XLSX.utils.encode_cell({ r, c: 2 });
    ws[addr].s = {
      fill: solidFill(bg),
      font: { color: { rgb: getTextColor(bg) }, bold: true },
    };
  }

  // ── 5. AUTO COLUMN WIDTHS ────────────────────────────────────────────────
  ws["!cols"] = header.map((_, i) => {
    const max = Math.max(
      ...worksheetData.map((row) => (row[i] ? String(row[i]).length : 10))
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
