"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../ui/table";
import { Transaction } from "./chart-area-interactive";
import { Badge } from "../ui/badge";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = parseFloat(row.getValue("amount"));
      return (
        <span className={type === "income" ? "text-green-600" : "text-red-600"}>
          {type === "income" ? "+" : "-"}${amount.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "income" ? "default" : "destructive"}>
          {type}
        </Badge>
      );
    },
  },
];

export default function DataTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
