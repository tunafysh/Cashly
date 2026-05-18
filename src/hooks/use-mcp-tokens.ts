
import { useCallback, useState } from "react";

export interface MCPToken {
  id: string;
  name: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

interface UseMCPTokensReturn {
  tokens: MCPToken[];
  loading: boolean;
  error: string | null;
  fetchTokens: () => Promise<void>;
  createToken: (name: string, expiresInDays?: number) => Promise<MCPToken | null>;
  deleteToken: (id: string) => Promise<boolean>;
}

export function useMCPTokens(): UseMCPTokensReturn {
  const [tokens, setTokens] = useState<MCPToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/tokens");
      if (!res.ok) {
        throw new Error("Failed to fetch tokens");
      }
      const data = await res.json();
      setTokens(
        data.tokens.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          expiresAt: t.expiresAt ? new Date(t.expiresAt) : null,
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createToken = useCallback(
    async (name: string, expiresInDays?: number): Promise<MCPToken | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/mcp/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, expiresInDays }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create token");
        }

        const data = await res.json();
        const newToken: MCPToken = {
          ...data,
          createdAt: new Date(data.createdAt),
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        };

        // Refresh token list
        await fetchTokens();
        return newToken;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTokens]
  );

  const deleteToken = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mcp/tokens?id=${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete token");
        }

        // Remove from local state
        setTokens((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    tokens,
    loading,
    error,
    fetchTokens,
    createToken,
    deleteToken,
  };
}
