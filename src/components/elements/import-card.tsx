"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, File, X } from "lucide-react";

export default function ImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function onImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const fileType = file.name.split(".").pop();

      formData.append("type", fileType || "csv");

      await fetch("/api/transactions/import", {
        method: "POST",
        body: formData,
      });

      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl border-dashed">
      <CardHeader>
        <CardTitle>Import transactions</CardTitle>
      </CardHeader>

      {/* ONLY CHANGE: wrap content in form */}
      <form onSubmit={onImport}>
        <CardContent className="px-6 space-y-4">
          <div
            onClick={() => document.getElementById("file")?.click()}
            className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-10 py-8 text-center cursor-pointer hover:bg-muted/40 transition"
          >
            <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:scale-105 transition" />

            {!file ? (
              <>
                <p className="text-sm font-medium">
                  Drop your file here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV, Excel (.xlsx), or JSON
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}

            <input
              id="file"
              type="file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* ACTION BAR (unchanged visually) */}
          <div className="mt-4 flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              {file ? "Ready to import" : "No file selected"}
            </div>

            <div className="flex gap-2">
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <Button
                type="submit"
                onClick={onImport as any}
                disabled={!file || loading}
                size="sm"
              >
                {loading ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
