import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export default async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
}
