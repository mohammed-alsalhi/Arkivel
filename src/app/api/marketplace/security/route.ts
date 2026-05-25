import { NextResponse } from "next/server";
import {
  localOnlyExtensionSecurityDocs,
  marketplaceSecurityContract,
  packProvenancePlan,
} from "@/lib/marketplace-security";

export async function GET() {
  return NextResponse.json({
    contract: marketplaceSecurityContract,
    localOnlyDocs: localOnlyExtensionSecurityDocs,
    provenance: packProvenancePlan,
  });
}
