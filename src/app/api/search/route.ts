// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "semantic";

  if (!query) {
    return NextResponse.json({ results: [], total: 0 });
  }
}
