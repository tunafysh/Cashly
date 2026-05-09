import Papa from "papaparse";
import { Transaction } from "@/components/elements/chart-area-interactive";
import { NextRequest } from "next/server";

const parseCsv = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        resolve(results.data as Transaction[]);
      },

      error: (error) => {
        reject(error);
      },
    });
  });
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const searchParams = new URL(req.url).searchParams;
  const type: "json" | "csv" = (searchParams.get("type") as "json" | "csv") || "json";

  if (!file) {
    return new Response("File parameter is required", { status: 400 });
  }

  let data: Transaction[] = [];

  if (type === "csv") {
    data = await parseCsv(file);
  }
  else {
    const text = await file.text();
    data = JSON.parse(text) as Transaction[];
  }
  
  
}