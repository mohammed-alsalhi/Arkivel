import { NextResponse } from "next/server";
import { apiV1Headers } from "@/lib/public-api-v1";
import { sdkMetadataContract } from "@/lib/sdk-types";

export async function GET() {
  return NextResponse.json(sdkMetadataContract, { headers: apiV1Headers });
}

export const dynamic = "force-dynamic";
