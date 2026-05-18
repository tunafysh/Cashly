import SubscriptionsTable from "@/components/elements/tables/subscriptions-table";
import { QuickCreateSubscriptionForm } from "@/components/elements/forms/quick-create-form";

export default function Subscriptions() {
  return (
    <div className="pt-6 md:pt-4">
      <div className="px-4 md:px-6 mb-4">
        <QuickCreateSubscriptionForm />
      </div>
      <SubscriptionsTable />
    </div>
  );
}
