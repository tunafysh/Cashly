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
    async (args: { limit?: number; offset?: number }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const transactions = (
        await getUserTransactions(
          global.mcpCurrentUserId,
          { limit: args.limit, offset: args.offset },
        )
      ).map((data) => ({
        ...data,
        amount: parseFloat(data.amount.toString()),
      }));

      return {
        content: [],
        structuredContent: { transactions },
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
        createdAt: z.string().optional().describe("Transaction date (ISO format)"),
        categoryName: z.string().describe("Category name"),
      }),
    },
    async (args: {
      amount: number;
      type: "income" | "expense";
      description?: string;
      createdAt?: string;
      categoryName: string;
    }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const category = await getCategoryByName(
        global.mcpCurrentUserId,
        args.categoryName,
      );
      if (!category) {
        throw new Error(`Category "${args.categoryName}" not found for user`);
      }

      const transaction = await createTransaction({
        userId: global.mcpCurrentUserId,
        amount: args.amount,
        type: args.type,
        categoryId: category.id,
        description: args.description,
        createdAt: args.createdAt ? new Date(args.createdAt) : undefined,
      });

      return {
        content: [],
        structuredContent: { transaction },
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
        content: [],
        structuredContent: { categories },
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
    async (args: { name: string; color?: string }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const category = args.color
        ? await createCategory({
            userId: global.mcpCurrentUserId,
            name: args.name,
            color: args.color,
          })
        : await createCategoryWithoutColor({
            userId: global.mcpCurrentUserId,
            name: args.name,
          });

      return {
        content: [],
        structuredContent: { category },
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
        content: [],
        structuredContent: { subscriptions },
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
    async (args: {
      name: string;
      amount: number;
      type: "monthly" | "yearly";
    }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available");
      }

      const now = new Date();
      const nextBillingAt =
        args.type === "monthly"
          ? sub(now, { months: -1 })
          : sub(now, { years: -1 });

      const subscription = await createSubscription({
        userId: global.mcpCurrentUserId,
        name: args.name,
        amount: args.amount,
        type: args.type,
        nextBillingAt,
      });

      return {
        content: [],
        structuredContent: { subscription },
      };
    }
  );

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
        content: [],
        structuredContent: budget || {},
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
    async (args: {
      amount: number;
      period: "yearly" | "monthly";
    }): Promise<CallToolResult> => {
      if (!global.mcpCurrentUserId) {
        throw new Error("User context not available"); 
      }

      const response = await setBudget(global.mcpCurrentUserId, args.amount, args.period);

      return {
        content: [],
        structuredContent: { response },
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
        content: [],
        structuredContent: response ? { summary: response } : {},
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
 * Shared MCP request handler for Streamable HTTP.
 * Supports GET/POST/DELETE by delegating method handling to the MCP transport.
 */
async function handleMcpRequest(req: NextRequest): Promise<NextResponse | Response> {
  // Authenticate request
  const userId = await authenticateRequest(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Set user context for tools
  global.mcpCurrentUserId = userId;

  try {
    const mcpServer = createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);
    return (await transport.handleRequest(req as unknown as Request)) as unknown as NextResponse;
  } catch (error) {
    console.error("[MCP] Request error:", error);
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
 * MCP Streamable HTTP handlers.
 * The transport internally dispatches each supported method.
 */
export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  return handleMcpRequest(req);
}

export async function GET(req: NextRequest): Promise<NextResponse | Response> {
  return handleMcpRequest(req);
}

export async function DELETE(req: NextRequest): Promise<NextResponse | Response> {
  return handleMcpRequest(req);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(
    null,
    {
      status: 204,
      headers: {
        Allow: "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID",
      },
    },
  );
}
