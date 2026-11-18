/** Rules for intake form files, shared by the browser (early warning) and the server (final check). */
export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

export type IntakeKind = "pdf" | "text";

/** Works out whether a file is a PDF or plain text, from its type or its name. */
export function intakeKind(file: { name: string; type: string }): IntakeKind | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (file.type === "text/plain" || name.endsWith(".txt")) return "text";
  return null;
}

/** Returns a friendly problem description, or null if the file is fine. */
export function checkIntakeFile(file: { name: string; type: string; size: number }): string | null {
  if (!intakeKind(file)) return "Please upload a PDF or a .txt file.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_FILE_BYTES) return "That file is over 4 MB. Please upload a smaller file.";
  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
