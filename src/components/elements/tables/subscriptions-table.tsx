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
import { Subscription } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Loader2, Trash2, Plus, X, Pencil } from "lucide-react";
import { useEffect, useState, useMemo, useTransition } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";

async function deleteSubscription(id: string) {
  try {
    const response = await fetch(`/api/subscriptions`, {
      method: "DELETE",
      body: JSON.stringify({ id: id }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete subscription");
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
      await deleteSubscription(id);
      onDelete(id);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete subscription",
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
              Are you sure you want to delete this subscription?
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

interface EditButtonProps {
  subscription: Subscription;
  onEdit: () => void;
}

function EditButton({ subscription, onEdit }: EditButtonProps) {
  const [open, setOpen] = useState(false);

  const handleEditSuccess = () => {
    setOpen(false);
    onEdit();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            subscription={subscription}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

const subscriptionColumns = (
  currency: string,
  onDelete: (id: string) => void,
  onEdit: () => void,
): ColumnDef<Subscription>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <span className="text-sm font-semibold">
          {formatCurrency(amount, currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Frequency",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const frequencyLabel = type === "monthly" ? "Monthly" : "Yearly";
      return (
        <Badge variant="secondary" className="text-xs">
          {frequencyLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "nextBillingAt",
    header: "Next Billing",
    cell: ({ row }) => {
      const date = new Date(row.getValue("nextBillingAt"));
      const today = new Date();
      const isUpcoming = date > today;
      
      return (
        <span className={`text-sm ${
          isUpcoming ? "text-muted-foreground" : "text-orange-600 dark:text-orange-400 font-semibold"
        }`}>
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      return (
        <div className="flex gap-1">
          <EditButton subscription={subscription} onEdit={onEdit} />
          <DeleteButton id={subscription.id} onDelete={onDelete} />
        </div>
      );
    },
  },
];

interface SubscriptionFormProps {
  onSuccess: () => void;
  subscription?: Subscription;
}

function SubscriptionForm({
  onSuccess,
  subscription,
}: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    amount: subscription?.amount?.toString() || "",
    type: (subscription?.type as "monthly" | "yearly") || ("monthly" as "monthly" | "yearly"),
  });

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Please enter a subscription name");
      }

      if (!formData.amount || isNaN(parseFloat(formData.amount))) {
        throw new Error("Please enter a valid amount");
      }

      const isEditing = !!subscription;
      const response = await fetch("/api/subscriptions", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing && { id: subscription.id }),
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type,
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update subscription" : "Failed to create subscription");
      }

      if (!isEditing) {
        setFormData({ name: "", amount: "", type: "monthly" });
      }
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
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          type="text"
          placeholder="e.g., Netflix, Spotify"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          required
        />
      </div>

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
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as "monthly" | "yearly" })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {subscription ? "Updating..." : "Creating..."}
            </>
          ) : (
            subscription ? "Update Subscription" : "Create Subscription"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 750);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "monthly" | "yearly">(
    "all"
  );
  const [isPending, startTransition] = useTransition();
  const { profile } = useProfile();

  // Update global filter when search input changes
  useEffect(() => {
    setGlobalFilter(debouncedSearchInput.toLowerCase());
  }, [debouncedSearchInput]);

  const isSearching = searchInput !== debouncedSearchInput;

  const fetchSubscriptions = () => {
    startTransition(() => {
      (async () => {
        try {
          const params = new URLSearchParams();
          if (typeFilter !== "all") params.append("type", typeFilter);

          const response = await fetch(
            `/api/subscriptions?${params.toString()}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch subscriptions");
          }
          const data = await response.json();
          setSubscriptions(data.subscriptions);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setInitialLoading(false);
        }
      })();
    });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [typeFilter]);

  const handleDelete = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleEdit = () => {
    fetchSubscriptions();
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchSubscriptions();
  };

  // Client-side search filter with memoization
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (!globalFilter) return true;
      return sub.name.toLowerCase().includes(globalFilter);
    });
  }, [subscriptions, globalFilter]);

  const columns = subscriptionColumns(
    profile?.currency || "USD",
    handleDelete,
    handleEdit
  );
  const table = useReactTable({
    data: filteredSubscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (initialLoading && subscriptions.length === 0) {
    return <Skeleton className="py-12 mx-4 md:mx-6" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-4 bg-background px-4 lg:px-6 py-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Subscriptions</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Subscription
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Create Subscription</DialogTitle>
                </DialogHeader>
                <SubscriptionForm
                  onSuccess={handleCreateSuccess}
                />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="text-sm"
            />
            {debouncedSearchInput && (
              <p className="text-xs text-muted-foreground mt-1">
                Searching: {globalFilter || "(no text)"}
              </p>
            )}
          </div>
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {(searchInput || typeFilter !== "all") && (
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
                Frequency: {typeFilter === "monthly" ? "Monthly" : "Yearly"}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {(isPending || isSearching) && subscriptions.length > 0 ? (
        <Card className="py-12 mx-4 lg:mx-6">
          <div className="flex justify-center items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
          </div>
        </Card>
      ) : error || filteredSubscriptions.length === 0 ? (
        <Card className="py-12 mx-4 lg:mx-6">
          <p className="text-center text-sm text-muted-foreground">
            No subscriptions found
            {searchInput || typeFilter !== "all"
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