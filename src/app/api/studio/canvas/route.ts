import { NextResponse } from "next/server";
import { getStudioReport, toJsonCanvas } from "@/lib/studio";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getStudioReport();
  const canvas = toJsonCanvas(report);

  return new NextResponse(JSON.stringify(canvas, null, 2), {
    headers: {
      "Content-Disposition": 'attachment; filename="arkivel-studio.canvas"',
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
