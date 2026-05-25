import { NextRequest, NextResponse } from "next/server";
import {
  builtInSpaceTemplates,
  createStarterSpaceImportPreview,
  exportSpaceTemplate,
  importSpaceTemplateJson,
  previewSpaceTemplate,
  spaceTemplateContract,
  spaceTemplateRegistry,
} from "@/lib/space-templates";

export async function GET() {
  return NextResponse.json(spaceTemplateRegistry);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body?.templateId === "string") {
    const importPreview = createStarterSpaceImportPreview(body.templateId);

    return NextResponse.json({
      contract: spaceTemplateContract,
      exportJson: importPreview.found ? importPreview.oneClickLocalImport.templateJson : null,
      importPreview,
      templates: builtInSpaceTemplates.map((item) => ({ id: item.id, name: item.name })),
    });
  }

  if (typeof body?.templateJson === "string") {
    const imported = importSpaceTemplateJson(body.templateJson);

    return NextResponse.json({
      contract: spaceTemplateContract,
      exportJson: imported.preview.validation.valid ? body.templateJson : null,
      preview: imported.preview,
      templates: builtInSpaceTemplates.map((item) => ({ id: item.id, name: item.name })),
    });
  }

  const template = body?.template;
  const preview = previewSpaceTemplate(template);

  return NextResponse.json({
    contract: spaceTemplateContract,
    exportJson: preview.validation.valid ? exportSpaceTemplate(template) : null,
    preview,
    templates: builtInSpaceTemplates.map((item) => ({ id: item.id, name: item.name })),
  });
}

export const dynamic = "force-dynamic";
