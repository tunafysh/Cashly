"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/table";
import { Transaction } from "./chart-area-interactive";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Spinner } from "../ui/spinner";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.getValue("description") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm">{category.name}</span>
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
        <span
          className={`text-sm font-semibold ${
            type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
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
        <Badge
          variant={type === "income" ? "default" : "destructive"}
          className="text-xs"
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
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

  if (loading) {
    return (
      <Card className="mx-4 flex items-center justify-center py-12 lg:mx-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-sm text-muted-foreground">
            Loading transactions...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-4 border-red-200 bg-red-50 py-6 dark:border-red-900 dark:bg-red-950 lg:mx-6">
        <p className="px-6 text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </p>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="mx-4 py-12 lg:mx-6">
        <p className="text-center text-sm text-muted-foreground">
          No transactions found
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-4 overflow-hidden lg:mx-6">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b bg-muted/40 hover:bg-muted/40"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-muted/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
