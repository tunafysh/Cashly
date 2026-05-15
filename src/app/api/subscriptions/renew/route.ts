import { renewDueSubscriptionsNow } from "@/db/queries/subscriptions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await renewDueSubscriptionsNow("monthly");
  await renewDueSubscriptionsNow("yearly");

  return NextResponse.json({ success: true });
}
