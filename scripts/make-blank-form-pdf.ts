/**
 * Draws the BLANK standard intake form as a PDF, straight from lib/intake-form.ts,
 * so the downloadable template always matches the questions the app expects.
 * Output: public/forms/tdc-standard-intake-form-v1.pdf  (run via npm run build:demo-data)
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { IMPORTANCE, INTAKE_FORM_VERSION, INTAKE_SECTIONS, NOTE_TEXT, type IntakeQuestion } from "../lib/intake-form";

export const BLANK_FORM_PATH = join("public", "forms", "tdc-standard-intake-form-v1.pdf");

const PAGE = { width: 595.28, height: 841.89 }; // A4
const M = 54; // margin
const FOREST = rgb(0x24 / 255, 0x4c / 255, 0x3c / 255);
const GOLD = rgb(0xac / 255, 0x71 / 255, 0x21 / 255);
const INK = rgb(0.11, 0.11, 0.11);
const MUTED = rgb(0.42, 0.4, 0.38);
const RULE = rgb(0.8, 0.78, 0.74);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(line);
  return lines;
}

export async function makeBlankFormPdf(root = process.cwd()) {
  const doc = await PDFDocument.create();
  doc.setTitle("TDC standard client intake form (v1)");
  doc.setSubject(INTAKE_FORM_VERSION);
  doc.setCreator("TDC prototype · generated from lib/intake-form.ts");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - M;
  let pageNo = 1;

  const footer = () =>
    page.drawText(`The Date Crew · Standard client intake form · ${INTAKE_FORM_VERSION} · page ${pageNo}`, {
      x: M, y: 28, size: 8, font: regular, color: MUTED,
    });
  const ensure = (height: number) => {
    if (y - height < M) {
      footer();
      page = doc.addPage([PAGE.width, PAGE.height]);
      pageNo++;
      y = PAGE.height - M;
    }
  };
  const text = (t: string, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number; gap?: number } = {}) => {
    const font = opts.font ?? regular;
    const size = opts.size ?? 10;
    const x = opts.x ?? M;
    for (const line of wrap(t, font, size, PAGE.width - M - x)) {
      ensure(size + 4);
      page.drawText(line, { x, y, size, font, color: opts.color ?? INK });
      y -= size + (opts.gap ?? 4);
    }
  };
  const writeLines = (count: number, x = M + 18) => {
    for (let i = 0; i < count; i++) {
      ensure(18);
      y -= 12;
      page.drawLine({ start: { x, y }, end: { x: PAGE.width - M, y }, thickness: 0.6, color: RULE });
      y -= 6;
    }
    y -= 8; // breathing room before the next line of text
  };
  const boxes = (prefix: string, options: string[], round: boolean, x = M + 18) => {
    const mark = round ? "( )" : "[ ]";
    text(`${prefix}${options.map((o) => `${mark} ${o}`).join("     ")}`, { x, size: 9.5 });
  };

  // ---------- header ----------
  page.drawText("THE DATE CREW", { x: M, y, size: 9, font: bold, color: GOLD });
  y -= 20;
  page.drawText("Standard client intake form", { x: M, y, size: 20, font: bold, color: FOREST });
  y -= 16;
  page.drawText(`Form version: ${INTAKE_FORM_VERSION}`, { x: M, y, size: 9, font: regular, color: MUTED });
  y -= 10;
  page.drawLine({ start: { x: M, y }, end: { x: PAGE.width - M, y }, thickness: 1, color: GOLD });
  y -= 18;
  text("Please answer in your own words. There are no wrong answers. Every TDC client answers the same questions, so your matchmaker can find matches that fit what matters to you.", { color: MUTED });
  y -= 4;
  text("How important is it?", { font: bold, size: 10.5, color: FOREST });
  text(`For every question with an importance mark, tick one: ${IMPORTANCE.join(" / ")}.`, { size: 9.5 });
  text("Deal-breaker: a match must meet it.   Nice to have: you'd prefer it, but it can bend.   Doesn't matter: leave it out.", { size: 9.5, color: MUTED });

  // ---------- sections ----------
  for (const s of INTAKE_SECTIONS) {
    ensure(60);
    y -= 12;
    text(`SECTION ${s.number}: ${s.title.toUpperCase()}`, { font: bold, size: 11, color: FOREST, gap: 6 });

    s.questions.forEach((q: IntakeQuestion, i) => {
      ensure(q.answerType === "Free text" ? 90 : 52);
      y -= 4;
      text(`${s.number}.${i + 1}  ${q.text}`, { font: bold, size: 10 });
      const opts = (q.options ?? []).filter((o) => !o.includes("__") || q.answerType !== "Range");
      if (q.answerType === "Single choice" || q.answerType === "Multiple choice") {
        boxes(q.answerType === "Multiple choice" ? "Tick all that apply:  " : "", opts.map((o) => o.replace(": __", ": ________")), q.answerType === "Single choice");
      } else if (q.answerType === "Range") {
        text(`From ________  to ________${q.options?.includes("No preference") ? "        [ ] No preference" : ""}`, { x: M + 18, size: 9.5 });
      } else if (q.answerType === "Free text") {
        writeLines(4);
      } else {
        writeLines(1);
      }
      if (q.importance) boxes("Importance:  ", [...IMPORTANCE], false);
      if (q.freeTextType === "deal_breaker") text("Anything you write here is treated as a deal-breaker.", { x: M + 18, size: 8.5, color: MUTED });
    });

    if (s.note) {
      ensure(40);
      y -= 4;
      text(`${s.number}.${s.questions.length + 1}  ${NOTE_TEXT} (optional)`, { size: 10, color: MUTED });
      writeLines(1);
    }
  }

  footer();
  writeFileSync(join(root, BLANK_FORM_PATH), await doc.save({ useObjectStreams: false }));
  return BLANK_FORM_PATH;
}
