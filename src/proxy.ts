import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
});
