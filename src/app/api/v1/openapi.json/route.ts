import { NextRequest, NextResponse } from "next/server";
import { apiV1Headers, createPublicApiV1OpenApiSpec } from "@/lib/public-api-v1";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  return NextResponse.json(createPublicApiV1OpenApiSpec(baseUrl), { headers: apiV1Headers });
}

export const dynamic = "force-dynamic";
