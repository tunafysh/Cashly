import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import { auth } from "@/lib/auth";
import { validateMCPToken } from "@/db/queries/mcp-tokens";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod/v4";
import type { CallToolResult } from "@modelcontextprotocol/server";
import {
  createTransaction,
  getSummary,
  getUserTransactions,
} from "@/db/queries/transactions";
import { Category, Subscription, Transaction } from "@/lib/types";
import {
  createCategory,
  createCategoryWithoutColor,
  getCategoryByName,
  getUserCategories,
} from "@/db/queries/categories";
import { createSubscription, getUserSubscriptions } from "@/db/queries/subscriptions";
import { sub } from "date-fns/sub";
import { getBudget, setBudget } from "@/db/queries/profiles";

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
        limit: z
          .number()
          .optional()
          .describe("Maximum number of transactions to return"),
        offset: z
          .number()
          .optional()
          .describe("Number of transactions to skip"),
      }),
    },
    async ({
      limit = undefined,
      offset = undefined,
    }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const transactions: Transaction[] = await getUserTransactions(
        global.mcpCurrentUserId,
        { limit: limit, offset: offset },
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transactions, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "create_transaction",
    {
      description: "Create a new transaction",
      inputSchema: z.object({
        amount: z.number().describe("Transaction amount"),
        type: z.enum(["income", "expense"]).describe("Transaction type"),
        description: z.string().optional().describe("Transaction description"),
        createdAt: z.date().optional().describe("Transaction date"),
        categoryName: z.string().describe("Category name"),
      }),
    },
    async ({
      amount,
      type,
      description,
      createdAt,
      categoryName,
    }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const category = await getCategoryByName(
        global.mcpCurrentUserId,
        categoryName,
      );
      if (!category) {
        throw new Error(`Category "${categoryName}" not found for user`);
      }

      const transaction = await createTransaction({
        userId: global.mcpCurrentUserId,
        amount,
        type,
        categoryId: category.id,
        description,
        createdAt,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transaction, null, 2),
          },
        ],
      };
    },
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

      const categories: Category[] = await getUserCategories(
        global.mcpCurrentUserId,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(categories, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "create_category",
    {
      description: "Create a new expense category",
      inputSchema: z.object({
        name: z.string().describe("Category name"),
        color: z.string().optional().describe("Category color (hex code)"),
      }),
    },
    async ({ name, color }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const category = color
        ? await createCategory({
            userId: global.mcpCurrentUserId,
            name,
            color: color,
          })
        : await createCategoryWithoutColor({
            userId: global.mcpCurrentUserId,
            name,
          });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(category, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_subscriptions",
    {
      description: "Fetch all active subscriptions",
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const subscriptions: Subscription[] = (
        await getUserSubscriptions(global.mcpCurrentUserId)
      ).map((data) => ({
        ...data,
        amount: parseFloat(data.amount.toString()),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(subscriptions, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "create_subscription",
    {
      description: "Create a new subscription",
      inputSchema: z.object({
        name: z.string().describe("Subscription name"),
        amount: z.number().describe("Subscription amount"),
        type: z.enum(["monthly", "yearly"]).describe("Subscription type"),
      }),
    },
    async ({ name, amount, type }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const now = new Date();
      const nextBillingAt =
        type === "monthly"
          ? sub(now, { months: -1 })
          : sub(now, { years: -1 });

      const subscription = await createSubscription({
        userId: global.mcpCurrentUserId,
        name,
        amount,
        type,
        nextBillingAt,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(subscription, null, 2),
          },
        ],
      };
    }
  )

  server.registerTool(
    "get_budget",
    {
      description: "Get current budget information (amount and period)",
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const budget = await getBudget(global.mcpCurrentUserId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(budget, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "set_budget",
    {
      description: "Set current budget information (amount and period)",
      inputSchema: z.object({
        amount: z.number().describe("New budget amount"),
        period: z.enum(["yearly", "monthly"]).describe("Budget period, (yearly or monthly)"),
      }),
    },
    async ({ amount, period }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available"); 
      }

      const response = await setBudget(global.mcpCurrentUserId, amount, period);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };  
    }
  );



  server.registerTool(
    "get_summary",
    {
      description: "Get current account summary (balance, income, expenses)",
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const response = await getSummary(global.mcpCurrentUserId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
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
    // Read body once for debugging
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);
    
    console.log("[MCP] Request method:", body.method);
    console.log("[MCP] User ID:", userId);

    // Create a fresh server for this request
    const mcpServer = createMcpServer();

    // For tools/list, add extra debugging
    if (body.method === "tools/list") {
      console.log("[MCP] TOOLS/LIST REQUEST RECEIVED");
    }

    // Create transport
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    // Connect server to transport
    await mcpServer.connect(transport);

    // Create a new Request from the body we read
    const newReq = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: bodyText,
    });

    // Handle the request
    const response = await transport.handleRequest(newReq as any);

    if (body.method === "tools/list") {
      const responseText = await response.clone().text();
      console.log("[MCP] TOOLS/LIST RESPONSE:", responseText);
    }

    console.log("[MCP] Responding to method:", body.method);
    return response as unknown as NextResponse;
  } catch (error) {
    console.error("[MCP] Error:", error);
    return new NextResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  } finally {
    global.mcpCurrentUserId = null;
  }
}

/**
 * GET handler for SSE (Server-Sent Events) streaming.
 * Not needed for stateless JSON responses - returns 405 Method Not Allowed.
 * For session-based streaming, implement session management via sessionIdGenerator.
 */
export async function GET(_req: NextRequest): Promise<Response> {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32601,
        message: "Method not allowed. Use POST for JSON-RPC requests.",
      },
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    },
  );
}
