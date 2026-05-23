import { MCPTokensManager } from "@/components/elements/uncategorized/mcp-tokens-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Tokens - Cashly",
  description: "Manage your MCP tokens in Cashly."
}

export default function McpTokens() {
  return (
    <div className="p-6 md:p-4">
      <MCPTokensManager />
    </div>
  );
}
