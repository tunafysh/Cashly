import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getUserSubscriptions,
  updateSubscription,
} from "@/db/queries/subscriptions";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    const subscriptions = await getUserSubscriptions(session.user.id);
    return NextResponse.json({ subscriptions });
  } else {
    const subscriptions = await getSubscriptionById(id, session.user.id);
    return NextResponse.json({ subscriptions });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, amount, type } = await req.json();

  if (!name || !amount || !type ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const nextBillingAt = new Date();
  if (type === "monthly") {
    nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
  } else if (type === "yearly") {
    nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);
  }

  const subscription = await createSubscription({
    userId: session.user.id,
    name,
    amount,
    type,
    nextBillingAt: nextBillingAt,
  });

  return NextResponse.json({ subscription });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, amount, type, nextBillingAt } = await req.json();
  if (!id) {
    return NextResponse.json(
      { error: "Missing subscription ID" },
      { status: 400 },
    );
  }

  const updated = await updateSubscription(session.user.id, id, {
    name,
    amount,
    type,
    nextBillingAt: nextBillingAt ? new Date(nextBillingAt) : undefined,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ subscription: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Missing subscription ID" },
      { status: 400 },
    );
  }

  const updated = await deleteSubscription(id, session.user.id);

  if (!updated) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ subscription: updated });
}
