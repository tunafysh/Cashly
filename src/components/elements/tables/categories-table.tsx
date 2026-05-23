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
import { Category } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Loader2, Trash2, Plus, Pencil } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

async function deleteCategory(id: string) {
  try {
    const response = await fetch(`/api/categories`, {
      method: "DELETE",
      body: JSON.stringify({ id: id }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete category");
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
      await deleteCategory(id);
      onDelete(id);
      toast.success("Category deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
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
              Are you sure you want to delete this category?
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
  category: Category;
  onEdit: () => void;
}

function EditButton({ category, onEdit }: EditButtonProps) {
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm category={category} onSuccess={handleEditSuccess} />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

const categoryColumns = (
  onDelete: (id: string) => void,
  onEdit: () => void,
): ColumnDef<Category>[] => [
  {
    accessorKey: "color",
    header: "",
    cell: ({ row }) => {
      const color = row.getValue("color") as string;
      return (
        <div
          className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: color }}
        />
      );
    },
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex gap-1">
          <EditButton category={category} onEdit={onEdit} />
          <DeleteButton id={category.id} onDelete={onDelete} />
        </div>
      );
    },
  },
];

interface CategoryFormProps {
  onSuccess: () => void;
  category?: Category;
}

function CategoryForm({ onSuccess, category }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    color: category?.color || "#3b82f6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Please enter a category name");
      }

      const isEditing = !!category;
      const response = await fetch("/api/categories", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing && { id: category.id }),
          name: formData.name,
          color: formData.color,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing ? "Failed to update category" : "Failed to create category",
        );
      }

      if (!isEditing) {
        setFormData({ name: "", color: "#3b82f6" });
      }
      toast.success(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully",
      );
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
          placeholder="e.g., Groceries, Entertainment"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            disabled={loading}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            disabled={loading}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? "Updating..." : "Creating..."}
            </>
          ) : category ? (
            "Update Category"
          ) : (
            "Create Category"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 750);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  // Update global filter when search input changes
  useEffect(() => {
    setGlobalFilter(debouncedSearchInput.toLowerCase());
  }, [debouncedSearchInput]);

  const isSearching = searchInput !== debouncedSearchInput;

  const fetchCategories = () => {
    startTransition(() => {
      (async () => {
        try {
          const response = await fetch(`/api/categories`);
          if (!response.ok) {
            throw new Error("Failed to fetch categories");
          }
          const data = await response.json();
          setCategories(data.categories);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setInitialLoading(false);
        }
      })();
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEdit = () => {
    fetchCategories();
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchCategories();
  };

  // Client-side search filter with memoization
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (!globalFilter) return true;
      return cat.name.toLowerCase().includes(globalFilter);
    });
  }, [categories, globalFilter]);

  const columns = categoryColumns(handleDelete, handleEdit);
  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (initialLoading && categories.length === 0) {
    return <Skeleton className="py-12 mx-4 md:mx-6" />;
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="space-y-4 bg-background px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <CategoryForm onSuccess={handleCreateSuccess} />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>

        {/* Search Input */}
        <div>
          <Input
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isPending}
            className="max-w-sm"
          />
          {isSearching && (
            <p className="text-xs text-muted-foreground mt-1">Searching...</p>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="mx-4 lg:mx-6">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="px-4 py-8 text-sm text-muted-foreground text-center"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <div className="mx-4 lg:mx-6 rounded-md bg-red-50 p-3 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
