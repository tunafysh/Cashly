import { getUserTransactions } from "@/db/queries/transactions";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const type = (formData.get("type") as string)?.toLowerCase();
    
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
          tx.category,
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
      const worksheetData = [
        ["Amount", "Type", "Category", "Description", "Created At"],
        ...data.map((tx) => [
          tx.amount,
          tx.type,
          tx.category,
          tx.description || "",
          tx.createdAt.toISOString(),
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
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
