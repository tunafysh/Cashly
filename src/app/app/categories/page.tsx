import CategoriesTable from "@/components/elements/tables/categories-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories - Cashly",
  description: "View and manage your expense categories in Cashly.",
};

export default function Categories() {
  return (
    <div className="pt-6 md:pt-4">
      <CategoriesTable />
    </div>
  );
}
