/**
 * Validates internal redirect targets to prevent open redirects.
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
  fallback = "/",
): string {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();

  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }

  if (trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}
