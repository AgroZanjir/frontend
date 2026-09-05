/**
 * Handing the reader a file.
 *
 * Every list on the panels had an "Export" button and none of them did
 * anything. The data is already on the screen and already translated, so the
 * honest export is what the reader is looking at - the same rows, the same
 * order, the same filter - rather than a second query that might answer
 * something else.
 */

/** A cell as it should appear in a spreadsheet. */
export type Cell = string | number | null | undefined;

const quote = (value: Cell): string => {
  const text = value == null ? "" : String(value);
  // A comma, a quote or a newline inside a field ends the field otherwise, and
  // one lot code with a comma in it would shift every column after it.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const save = (name: string, type: string, body: BlobPart) => {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Freed on the next tick: revoking it before the click is handled cancels
  // the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Today, as a filename wants it. */
const stamp = () => new Date().toISOString().slice(0, 10);

/**
 * A spreadsheet of what is on screen.
 *
 * The BOM is what makes Excel read it as UTF-8; without it every Uzbek and
 * Russian heading arrives as mojibake, which is worse than no export.
 */
export const downloadCsv = (
  name: string,
  head: string[],
  rows: Cell[][],
): void =>
  save(
    `${name}-${stamp()}.csv`,
    "text/csv;charset=utf-8",
    "﻿" + [head, ...rows].map((r) => r.map(quote).join(",")).join("\r\n"),
  );

/** The records behind a screen, for a reader who needs the whole thing. */
export const downloadJson = (name: string, body: unknown): void =>
  save(
    `${name}-${stamp()}.json`,
    "application/json",
    JSON.stringify(body, null, 2),
  );
