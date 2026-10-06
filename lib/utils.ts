/**
 * Utility to merge class names safely.
 * Filters out falsy values. No external dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}