import crypto from 'crypto';

/**
 * Generates a customer-friendly, non-sequential, safe enquiry reference code.
 * Example format: DF-202610-8A7F9B
 */
export function generateEnquiryReference(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  
  // 6 random uppercase alphanumeric characters (excluding confusing characters 0, O, 1, I)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += charset[randomBytes[i] % charset.length];
  }

  return `DF-${year}${month}-${randomCode}`;
}

/**
 * Generates a cryptographically secure, high-entropy tracking token (256-bit).
 * Stored only in memory during response and NEVER directly in the database.
 */
export function generateTrackingToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes a SHA-256 cryptographic digest of a raw tracking token.
 * Only this hash is persisted to the database.
 */
export function hashTrackingToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Masks a customer's full name to avoid leaking PII in public tracking views.
 * Example: "Chukwudi Okafor" -> "C. Okafor", "Alex" -> "A***x"
 */
export function maskCustomerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Customer';
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastName = parts[parts.length - 1];
    return `${firstInitial}. ${lastName}`;
  }
  if (trimmed.length <= 2) return trimmed;
  return `${trimmed.charAt(0)}***${trimmed.charAt(trimmed.length - 1)}`;
}
