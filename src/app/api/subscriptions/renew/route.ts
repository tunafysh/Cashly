import { renewDueSubscriptionsNow } from "@/db/queries/subscriptions";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await renewDueSubscriptionsNow("monthly");
  await renewDueSubscriptionsNow("yearly");

  return NextResponse.json({ success: true });
}
