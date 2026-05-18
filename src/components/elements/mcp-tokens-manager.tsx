import { useEffect, useState } from "react";
import { useMCPTokens } from "@/hooks/use-mcp-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Plus, Copy, Check, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface MCPTokensManagerProps {
  onTokenCreated?: (token: string) => void;
}

export function MCPTokensManager({ onTokenCreated }: MCPTokensManagerProps) {
  const { tokens, loading, error, fetchTokens, createToken, deleteToken } = useMCPTokens();
  const [isCreating, setIsCreating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");
  const [showNewToken, setShowNewToken] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreate = async () => {
    if (!tokenName.trim()) {
      alert("Token name is required");
      return;
    }

    setIsCreating(true);
    try {
      const expiresIn = expiresInDays ? parseInt(expiresInDays) : undefined;
      const newToken = await createToken(tokenName.trim(), expiresIn);

      if (newToken) {
        setNewTokenValue(newToken.token);
        setShowNewToken(true);
        setTokenName("");
        setExpiresInDays("");
        onTokenCreated?.(newToken.token);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteToken(id);
    if (!success) {
      alert("Failed to delete token");
    }
  };

  const handleCopyToken = (fullToken: string, tokenId: string) => {
    navigator.clipboard.writeText(fullToken);
    setCopiedId(tokenId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (tokenId: string) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId);
    } else {
      newVisible.add(tokenId);
    }
    setVisibleTokens(newVisible);
  };

  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">MCP Tokens</CardTitle>
      <CardDescription>Create and manage tokens for API access</CardDescription>

      {/* Create New Token Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create New Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Token Name</label>
            <Input
              placeholder="e.g. Claude Desktop, My App"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              disabled={isCreating || showNewToken}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expires in (days)</label>
            <Input
              type="number"
              placeholder="Leave empty for no expiration"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              disabled={isCreating || showNewToken}
              className="mt-2"
              min="1"
            />
          </div>

          {showNewToken && newTokenValue && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">Token created successfully!</p>
              <p className="text-sm text-green-800 mb-3">Save this token. You won't be able to see it again.</p>
              <div className="flex items-center gap-2 p-2 bg-white border border-green-200 rounded font-mono text-xs">
                <span className="flex-1 truncate">{newTokenValue}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyToken(newTokenValue, "new")}
                >
                  {copiedId === "new" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setShowNewToken(false);
                  setNewTokenValue(null);
                }}
                className="mt-3"
              >
                Done
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={isCreating || showNewToken || !tokenName.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tokens List */}
      <div>
        <h3 className="text-sm font-medium mb-3">Your Tokens</h3>

        {loading && !tokens.length ? (
          <div className="flex items-center justify-center p-8">
            <Spinner className="w-5 h-5" />
          </div>
        ) : tokens.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              No tokens yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => (
              <Card key={token.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{token.name}</p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-foreground">
                          {token.token}
                        </span>
                      </p>
                      <p>Created: {format(new Date(token.createdAt), "MMM d, yyyy")}</p>
                      {token.expiresAt && (
                        <p>
                          Expires: {format(new Date(token.expiresAt), "MMM d, yyyy")}{" "}
                          {new Date(token.expiresAt) < new Date() && (
                            <span className="text-red-600 font-medium">(Expired)</span>
                          )}
                        </p>
                      )}
                      <p>Status: {token.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Token</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{token.name}"? This action cannot be
                          undone.
                        </AlertDialogDescription>
                        <div className="flex gap-3 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(token.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
