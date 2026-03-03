import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Simple ePub export — generates a minimal valid ePub 3 zip.
 * Avoids external epub-gen dependency for better compatibility.
 */

import JSZip from "jszip";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buildEpub(title: string, content: string): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const id = "wiki-article";
  const lang = "en";
  const now = new Date().toISOString().split("T")[0];

  // mimetype (must be first, uncompressed)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // META-INF/container.xml
  zip.folder("META-INF")!.file(
    "container.xml",
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const epub = zip.folder("EPUB")!;

  // Chapter XHTML
  epub.file(
    "chapter.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">
<head><meta charset="UTF-8"/><title>${escapeXml(title)}</title></head>
<body><h1>${escapeXml(title)}</h1>${content}</body>
</html>`
  );

  // package.opf
  epub.file(
    "package.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${id}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${lang}</dc:language>
    <meta property="dcterms:modified">${now}T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>`
  );

  // nav.xhtml
  epub.file(
    "nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Table of Contents</title></head>
<body>
  <nav epub:type="toc"><h1>Contents</h1>
    <ol><li><a href="chapter.xhtml">${escapeXml(title)}</a></li></ol>
  </nav>
</body>
</html>`
  );

  const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
  return arrayBuffer;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await buildEpub(article.title, article.content);
  const filename = `${article.title.replace(/[^a-z0-9]/gi, "_")}.epub`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/epub+zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
