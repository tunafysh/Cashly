import { BudgetModifier } from "@/components/elements/uncategorized/budget-modifier";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget - Cashly",
  description: "Set and manage your monthly budget in Cashly.",
};

export default function Budget() {
  return (
    <div className="p-6 md:p-4">
      <BudgetModifier />
    </div>
  );
}
