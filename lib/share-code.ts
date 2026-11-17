import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function createShareCode(length = 12) {
  const bytes = randomBytes(length);
  return Array.from(bytes, byte => ALPHABET[byte % ALPHABET.length]).join("");
}

export function normalizeShareCode(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function isValidShareCode(value: string) {
  return /^[A-HJ-NP-Z2-9]{12}$/.test(value);
}
