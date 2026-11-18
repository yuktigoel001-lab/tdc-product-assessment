/**
 * Turns the text sources in scripts/pdf-sources into simple, real-looking PDF intake forms
 * in public/sample-forms. Run with: npm run make:pdfs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";

const SRC = join(process.cwd(), "scripts", "pdf-sources");
const OUT = join(process.cwd(), "public", "sample-forms");

const PAGE = { width: 595.28, height: 841.89 }; // A4
const MARGIN = 60;
const SIZE = 10.5;
const LINE = 15.5;
const FOREST = rgb(0x24 / 255, 0x4c / 255, 0x3c / 255);
const GOLD = rgb(0xac / 255, 0x71 / 255, 0x21 / 255);
const INK = rgb(0.11, 0.11, 0.11);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return lines;
}

async function makePdf(sourcePath: string) {
  const [title, ...rest] = readFileSync(sourcePath, "utf8").trimEnd().split("\n");
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor("Client (fictional sample)");
  doc.setCreator("TDC prototype sample generator");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;
  const maxWidth = PAGE.width - MARGIN * 2;

  const newPageIfNeeded = () => {
    if (y < MARGIN) {
      page = doc.addPage([PAGE.width, PAGE.height]);
      y = PAGE.height - MARGIN;
    }
  };

  page.drawText(title, { x: MARGIN, y, size: 14, font: bold, color: FOREST });
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE.width - MARGIN, y }, thickness: 1, color: GOLD });
  y -= LINE * 1.4;

  for (const raw of rest) {
    if (raw.trim() === "") {
      y -= LINE * 0.6;
      continue;
    }
    const isSection = raw.startsWith("SECTION");
    const font = isSection ? bold : regular;
    const color = isSection ? FOREST : INK;
    if (isSection) y -= LINE * 0.4;
    for (const line of wrap(raw, font, SIZE, maxWidth)) {
      newPageIfNeeded();
      page.drawText(line, { x: MARGIN, y, size: SIZE, font, color });
      y -= LINE;
    }
  }

  const name = basename(sourcePath, ".txt");
  writeFileSync(join(OUT, `${name}.pdf`), await doc.save({ useObjectStreams: false }));
  console.log(`✓ public/sample-forms/${name}.pdf`);
}

async function main() {
  for (const file of readdirSync(SRC).filter((f) => f.endsWith(".txt"))) {
    await makePdf(join(SRC, file));
  }
}

main();
