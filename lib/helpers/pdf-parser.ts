import { readFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";
import { PDFParse } from "pdf-parse";

async function loadPdfPages(filePath: string): Promise<Document[]> {
  let buffer: Buffer;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = readFileSync(filePath);
  }

  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });
  try {
    const { pages } = await parser.getText();
    return pages.map(
      (page) =>
        new Document({
          pageContent: page.text,
          metadata: { source: filePath, page: page.num - 1 },
        })
    );
  } finally {
    await parser.destroy();
  }
}

export default loadPdfPages;