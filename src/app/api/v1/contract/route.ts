import { NextResponse } from "next/server";
import { apiV1Headers, publicApiV1Contract } from "@/lib/public-api-v1";

export async function GET() {
  return NextResponse.json(publicApiV1Contract, { headers: apiV1Headers });
}

export const dynamic = "force-dynamic";
