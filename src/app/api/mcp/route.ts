import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { auth } from "@/lib/auth";
import { validateMCPToken } from "@/db/queries/mcp-tokens";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod/v4";
import type { CallToolResult } from "@modelcontextprotocol/server";

// Auth context for tools (stored temporarily during request)
declare global {
  var mcpCurrentUserId: string | null;
}

/**
 * Create a fresh MCP server per request to ensure clean context.
 * The tools will have access to the current user via the global context.
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "cashly",
    version: "1.0.0",
  });

  // Register tools - context injected via global mcpCurrentUserId during request
  server.registerTool(
    "get_transactions",
    {
      description: "Fetch user transactions",
      inputSchema: z.object({
        limit: z.number().optional().describe("Maximum number of transactions to return"),
        offset: z.number().optional().describe("Number of transactions to skip"),
      }),
    },
    async ({ limit = 10, offset = 0 }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }
      // TODO: Implement database query with:
      // const transactions = await getTransactionsByUserId(global.mcpCurrentUserId, limit, offset);
      return {
        content: [
          {
            type: "text",
            text: `Fetching ${limit} transactions for user ${global.mcpCurrentUserId} (offset: ${offset})`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_categories",
    {
      description: "Fetch all expense categories",
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }
      // TODO: Implement database query with:
      // const categories = await getCategoriesByUserId(global.mcpCurrentUserId);
      return {
        content: [
          {
            type: "text",
            text: `Fetching categories for user ${global.mcpCurrentUserId}`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_balance",
    {
      description: "Get current account balance",
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }
      // TODO: Implement database query with:
      // const profile = await getProfileByUserId(global.mcpCurrentUserId);
      // return profile.balance
      return {
        content: [
          {
            type: "text",
            text: `Fetching balance for user ${global.mcpCurrentUserId}`,
          },
        ],
      };
    }
  );

  return server;
}

/**
 * Authenticate the request and set the current user context.
 * Returns null if authentication fails.
 */
async function authenticateRequest(req: NextRequest): Promise<string | null> {
  // Try Bearer token auth first
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const mcpToken = await validateMCPToken(token);

    if (mcpToken) {
      return mcpToken.userId;
    }
  }

  // Fall back to NextAuth session
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  return null;
}

/**
 * MCP HTTP endpoint using Streamable HTTP transport (Web Standard).
 * This follows the official MCP SDK documentation for Next.js.
 * 
 * The transport automatically handles:
 * - JSON-RPC request/response routing
 * - SSE streaming for long-running operations
 * - Method dispatch (initialize, tools/list, tools/call, etc.)
 */
export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  // Authenticate request
  const userId = await authenticateRequest(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Set user context for tools
  global.mcpCurrentUserId = userId;

  try {
    // Create a fresh server and transport for this request
    const mcpServer = createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless: no session management
    });

    // Connect server to transport
    await mcpServer.connect(transport);

    // Get raw request body for transport
    const body = await req.json();

    // Use transport's built-in request handler
    // This handles all JSON-RPC routing automatically
    const response = await transport.handleRequest(req as unknown as Request);

    return response as unknown as NextResponse;
  } catch (error) {
    console.error("MCP route error:", error);
    return new NextResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // Clean up user context
    global.mcpCurrentUserId = null;
  }
}

/**
 * GET handler for SSE (Server-Sent Events) streaming.
 * Required by MCP Streamable HTTP transport for bi-directional communication.
 */
export async function GET(req: NextRequest): Promise<Response> {
  // Authenticate request
  const userId = await authenticateRequest(req);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Set user context for tools
  global.mcpCurrentUserId = userId;

  try {
    // Create a fresh server and transport for this SSE stream
    const mcpServer = createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless: no session management
    });

    // Connect server to transport
    await mcpServer.connect(transport);

    // Use transport's built-in request handler for SSE
    const response = await transport.handleRequest(req as unknown as Request);

    return response;
  } catch (error) {
    console.error("MCP GET (SSE) error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // Clean up user context
    global.mcpCurrentUserId = null;
  }
}
