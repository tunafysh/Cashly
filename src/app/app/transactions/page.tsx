import TransactionOverview from "@/components/elements/tables/transaction-overview-table";
import { useProfile } from "@/lib/profile-context";

export default function Transactions() {
  const { profile } = useProfile();
  const currency = profile?.currency;

  return (
    <TransactionOverview currency={currency} />
  );
}
