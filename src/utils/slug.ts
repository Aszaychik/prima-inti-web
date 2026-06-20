import slugify from 'slugify';

// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Generate SEO-friendly slug from product model name + full UUID
 * Example: "MELSERVO-J5" + "0acbc8c4-..." -> "melservo-j5-0acbc8c4-..."
 */
export function generateProductSlug(model: string, id: string): string {
  const slug = slugify(model, { lower: true, strict: true });
  return `${slug}-${id}`;
}

/**
 * Extract UUID from a slug param.
 * Works for both formats:
 * - Old: "0acbc8c4-948f-4d62-acbc-193536475a90" (pure UUID)
 * - New: "melservo-j5-0acbc8c4-948f-4d62-acbc-193536475a90" (slug + UUID)
 */
export function extractIdFromSlug(slugParam: string): string | null {
  // Pure UUID (old link format)
  if (UUID_REGEX.test(slugParam)) {
    return slugParam;
  }
  // Slug + UUID: UUID is always the last 36 characters
  const possibleId = slugParam.slice(-36);
  if (UUID_REGEX.test(possibleId)) {
    return possibleId;
  }
  return null;
}

/**
 * Check if the given slug param is the canonical (slug+id) format,
 * not just a raw UUID.
 */
export function isCanonicalSlug(slugParam: string): boolean {
  return !UUID_REGEX.test(slugParam);
}