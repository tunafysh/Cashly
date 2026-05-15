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
  };
};

export type Category = {
  id: string;
  name: string;
  color: string;
};
