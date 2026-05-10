"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportPanel() {
  const [fileType, setFileType] = useState("csv");
  const [loading, setLoading] = useState(false);

  const fileName = `transactions.${fileType}`;

  const icon =
    fileType === "json" ? (
      <FileJson className="w-5 h-5" />
    ) : fileType === "xlsx" ? (
      <FileSpreadsheet className="w-5 h-5" />
    ) : (
      <FileText className="w-5 h-5" />
    );

  async function handleExport() {
    setLoading(true);

    try {
      // your export logic here
      await new Promise((r) => setTimeout(r, 1000));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle>Export Transactions</CardTitle>
        <CardDescription>
          Download your transactions in your preferred format.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* FORMAT SELECT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export format</label>

          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* FILE PREVIEW */}
        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
              {icon}
            </div>

            <div>
              <p className="text-sm font-medium">{fileName}</p>

              <p className="text-xs text-muted-foreground">Ready to export</p>
            </div>
          </div>

          <Badge variant="secondary">{fileType.toUpperCase()}</Badge>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={loading} className="gap-2">
            <Download className="w-4 h-4" />

            {loading ? "Exporting..." : "Export"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
