import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Cashly",
  description:
    "View your financial overview and insights on the Cashly dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
