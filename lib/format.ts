const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** "12 Nov 2026" (India time, so it's the same on the server and in the browser). */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "12 Nov, 4:35 pm" */
export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}
