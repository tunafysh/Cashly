"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/lib/profile-context";
import { Transaction, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getExpandedRowModel,
  ExpandedState,
} from "@tanstack/react-table";
import { Loader2, Trash2, Plus, X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/elements/selectors/date-range-picker";
import { useDebounce } from "@/hooks/use-debounce";
import { parseNaturalLanguageSearch } from "@/lib/parse-natural-language";

async function deleteTransaction(id: string) {
  try {
    const response = await fetch(`/api/transactions`, {
      method: "DELETE",
      body: JSON.stringify({ id: id }),
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
    try {
      setDeleting(true);
      await deleteTransaction(id);
      onDelete(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-destructive/10 hover:text-destructive"
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}

const transactionColumns = (
  currency: string,
  onDelete: (id: string) => void,
): ColumnDef<Transaction>[] => [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
          {date.toLocaleTimeString("en-US", {
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
      if (!category) {
        return (
          <Badge variant="outline" className="text-sm">
            Uncategorized
          </Badge>
        );
      }

      return (
        <Badge
          className={`text-sm border-[${category.color}] bg-[${category.color}/10] py-2`}
          variant="secondary"
        >
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

interface CreateTransactionFormProps {
  categories: Category[];
  onSuccess: () => void;
}

function CreateTransactionForm({
  categories,
  onSuccess,
}: CreateTransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    categoryId: "",
    description: "",
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.amount || isNaN(parseFloat(formData.amount))) {
        throw new Error("Please enter a valid amount");
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId || null,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      setFormData({ amount: "", type: "expense", categoryId: "", description: "" });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as "income" | "expense" })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category (Optional)</label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
        <Input
          type="text"
          placeholder="Add a note..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Transaction"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 1000);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");
  const { profile } = useProfile();

  // Parse natural language from search input
  useEffect(() => {
    const parsed = parseNaturalLanguageSearch(debouncedSearchInput);
    setGlobalFilter(parsed.search);
    // Clear and set dates - only keep them if parsed dates exist
    setDateRangeStart(parsed.fromDate || "");
    setDateRangeEnd(parsed.toDate || "");
  }, [debouncedSearchInput]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (globalFilter) params.append("search", globalFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (dateRangeStart) params.append("fromDate", dateRangeStart);
      if (dateRangeEnd) params.append("toDate", dateRangeEnd);

      const response = await fetch(
        `/api/transactions?${params.toString()}`
      );
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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [globalFilter, typeFilter, categoryFilter, dateRangeStart, dateRangeEnd]);

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchTransactions();
  };

  const columns = transactionColumns(profile?.currency || "USD", handleDelete);
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading && transactions.length === 0) {
    return <Skeleton className="py-12" />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 py-6 dark:border-red-900 dark:bg-red-950 mx-4 lg:mx-6">
        <p className="px-6 text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-4 bg-background px-4 lg:px-6 py-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Create Transaction</DialogTitle>
                </DialogHeader>
                <CreateTransactionForm
                  categories={categories}
                  onSuccess={handleCreateSuccess}
                />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Input
              placeholder="Search by description... (e.g. 'from 4 days ago')"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="text-sm"
            />
            {debouncedSearchInput && (
              <p className="text-xs text-muted-foreground mt-1">
                Searching: {globalFilter || "(no text)"}{dateRangeStart ? ` from ${dateRangeStart}` : ""}{dateRangeEnd ? ` to ${dateRangeEnd}` : ""}
              </p>
            )}
          </div>
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="md:col-span-1">
            <DateRangePicker
              value={{ from: dateRangeStart, to: dateRangeEnd }}
              onDateRangeChange={(from, to) => {
                setDateRangeStart(from);
                setDateRangeEnd(to);
              }}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchInput ||
          typeFilter !== "all" ||
          categoryFilter ||
          dateRangeStart ||
          dateRangeEnd) && (
          <div className="flex flex-wrap gap-2">
            {searchInput && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setSearchInput("")}
              >
                Search: {searchInput}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setTypeFilter("all")}
              >
                Type: {typeFilter}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {categoryFilter && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setCategoryFilter("")}
              >
                Category: {categories.find((c) => c.id === categoryFilter)?.name}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {dateRangeStart && dateRangeEnd && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => {
                  setDateRangeStart("");
                  setDateRangeEnd("");
                }}
              >
                {dateRangeStart} to {dateRangeEnd}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {dateRangeStart && !dateRangeEnd && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setDateRangeStart("")}
              >
                From: {dateRangeStart}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {dateRangeEnd && !dateRangeStart && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setDateRangeEnd("")}
              >
                To: {dateRangeEnd}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <Card className="py-12 mx-4 lg:mx-6">
          <p className="text-center text-sm text-muted-foreground">
            No transactions found
            {searchInput ||
            typeFilter !== "all" ||
            categoryFilter ||
            dateRangeStart ||
            dateRangeEnd
              ? " matching your filters"
              : ""}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden mx-4 lg:mx-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b bg-muted/50 hover:bg-muted/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-foreground/70 h-12"
                    >
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
