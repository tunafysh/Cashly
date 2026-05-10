import { deleteUserProfile, getUserProfile, updateUserProfile } from "@/db/queries/profiles";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const profile = await getUserProfile(userId);

    if (!profile) {
        return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const data = await req.json();
    const { currency, budget, budgetPeriod } = data;

    await updateUserProfile(userId, { currency, budget, budgetPeriod });

    return NextResponse.json({ message: "Profile updated successfully" });
}

export async function DELETE() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    await deleteUserProfile(userId);
    return NextResponse.json({ message: "Profile deleted successfully" });
}