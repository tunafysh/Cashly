"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CategoryList() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (e: unknown) {
        toast.error(
          e instanceof Error ? e.message : "Failed to load categories",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const getTextColor = (bgColor: string) => {
    const rgb = parseInt(bgColor.replace("#", ""), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
          style={{ backgroundColor: category.color }}
        >
          <h3
            className="text-xl font-bold text-center"
            style={{ color: getTextColor(category.color) }}
          >
            {category.name}
          </h3>
        </Card>
      ))}
    </div>
  );
}
