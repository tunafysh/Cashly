import ExportCard from "@/components/elements/export-card";
import ImportCard from "@/components/elements/import-card";

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
        <div className="w-full grid grid-cols-2">
          <ImportCard />
          <ExportCard />
        </div>
      </div>
    </div>
  );
}
