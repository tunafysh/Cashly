"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfile } from "@/lib/profile-context";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

async function deleteTransaction(id: string) {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete transaction");
    }
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => void;
}

function DeleteButton({ id, onDelete }: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete 1this transaction?")) return;
    
    try {
      setDeleting(true);
      await deleteTransaction(id);
      onDelete(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete transaction");
      setDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

const transactionColumns = (currency: string, onDelete: (id: string) => void): ColumnDef<Transaction>[] => [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
        <Badge className={`text-sm border-[${category.color}] bg-[${category.color}/10] py-2`} variant="secondary">
          <div
            className="h-3 w-3 rounded-full ring-1 ring-offset-1 ring-offset-background"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm">{category.name}</span>
        </Badge>
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
          {type === "income" ? "+" : "-"}
          {formatCurrency(amount, currency)}
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id: string = row.original.id;
      return <DeleteButton id={id} onDelete={onDelete} />;
    },
  },
];

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();

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

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const columns = transactionColumns(profile?.currency || "USD", handleDelete);
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <Skeleton className="py-12 lg:mx-6 mx-4" />;
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
              className="border-b bg-muted/50 hover:bg-muted/50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold text-foreground/70 h-12">
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
              className="hover:bg-muted/30 transition-colors border-b"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
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
