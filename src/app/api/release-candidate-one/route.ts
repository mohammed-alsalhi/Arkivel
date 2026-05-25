import { NextResponse } from "next/server";
import { createReleaseCandidateOneReport } from "@/lib/release-candidate-one";

export async function GET() {
  return NextResponse.json(createReleaseCandidateOneReport());
}
