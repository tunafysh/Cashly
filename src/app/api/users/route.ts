import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(req: NextRequest){
    let status = 500
    return NextResponse.json({ status })
}