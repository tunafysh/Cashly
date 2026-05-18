import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMCPTokensByUser,
  createMCPToken,
  revokeMCPToken,
  deleteMCPToken,
} from "@/db/queries/mcp-tokens";
import { randomBytes } from "crypto";

/**
 * Generate a secure random token for MCP authentication.
 * Format: "cashly_" + hex string for easy identification.
 */
function generateToken(): string {
  return "cashly_" + randomBytes(32).toString("hex");
}

/**
 * GET /api/mcp/tokens - List all MCP tokens for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await getMCPTokensByUser(session.user.id);

    // Don't expose the full token value to frontend (security best practice)
    // Only show masked version with first few chars visible
    const maskToken = (token: string) => {
      const visible = token.slice(0, 10);
      const total = token.length;
      return `${visible}${"*".repeat(Math.max(0, total - 10))}`;
    };

    return NextResponse.json({
      tokens: tokens.map((t) => ({
        id: t.id,
        name: t.name,
        token: maskToken(t.token),
        isActive: t.isActive,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/mcp/tokens error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mcp/tokens - Create a new MCP token
 *
 * Request body:
 * {
 *   name: string,               // Human-readable name for the token
 *   expiresInDays?: number,     // Optional: token expires in N days (default: never)
 * }
 *
 * Response:
 * {
 *   id: string,
 *   name: string,
 *   token: string,              // Full token - only shown once!
 *   isActive: boolean,
 *   createdAt: Date,
 *   expiresAt: Date | null,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, expiresInDays } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Token name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Token name must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Calculate expiration date if provided
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      if (!Number.isInteger(expiresInDays) || expiresInDays <= 0) {
        return NextResponse.json(
          { error: "expiresInDays must be a positive integer" },
          { status: 400 }
        );
      }

      if (expiresInDays > 365 * 10) {
        return NextResponse.json(
          { error: "Token expiration cannot exceed 10 years" },
          { status: 400 }
        );
      }

      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Generate and store the token
    const token = generateToken();
    const result = await createMCPToken(
      session.user.id,
      name,
      token,
      expiresAt
    );

    if (!result[0]) {
      return NextResponse.json(
        { error: "Failed to create token" },
        { status: 500 }
      );
    }

    const created = result[0];

    // Return the full token only once - frontend must save it
    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        token: created.token, // Full token - last time it's visible
        isActive: created.isActive,
        createdAt: created.createdAt,
        expiresAt: created.expiresAt,
        warning:
          "Save this token somewhere safe. You won't be able to see it again!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/mcp/tokens error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mcp/tokens/:id - Revoke/delete a token
 *
 * Query param: ?id=tokenId
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get token ID from query params
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("id");

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID required" }, { status: 400 });
    }

    // Verify the token belongs to the current user before deleting
    const allTokens = await getMCPTokensByUser(session.user.id);
    const tokenExists = allTokens.some((t) => t.id === tokenId);

    if (!tokenExists) {
      return NextResponse.json(
        { error: "Token not found or does not belong to you" },
        { status: 404 }
      );
    }

    // Delete the token
    await deleteMCPToken(tokenId);

    return NextResponse.json({
      success: true,
      message: "Token deleted",
    });
  } catch (error) {
    console.error("DELETE /api/mcp/tokens error:", error);
    return NextResponse.json(
      { error: "Failed to delete token" },
      { status: 500 }
    );
  }
}
