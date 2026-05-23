import TransactionsTable from "@/components/elements/tables/transaction-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions - Cashly",
  description: "View and manage your transactions in Cashly.",
};

export default function Transactions() {
  return (
    <div className="pt-6 md:pt-4">
      <TransactionsTable />
    </div>
  );
}
