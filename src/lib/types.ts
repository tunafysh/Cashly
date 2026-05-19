export type FileTypes = "json" | "csv" | "xlsx";

export type Transaction = {
  id: string;
  amount: string;
  type: "income" | "expense";
  description?: string | null;
  createdAt: Date;

  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  type: "monthly" | "yearly";
  createdAt: Date;
  nextBillingAt: Date;
};
