/** Tiny className joiner (no runtime dependency needed for this project). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
