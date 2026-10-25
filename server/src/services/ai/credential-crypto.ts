import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM for learners' own AI provider keys. The server key comes from
// AI_KEY_ENCRYPTION_KEY (32 bytes, base64). The user id is bound in as
// associated data, so a ciphertext copied onto another user's row fails to
// decrypt instead of quietly lending one learner's key to another.

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;
// Pinned so a truncated tag is rejected rather than checked with fewer bits.
const TAG_BYTES = 16;

export type EncryptedSecret = { ciphertext: string; iv: string; authTag: string };

/** Decode the server key, or null when it is missing or the wrong length. */
export function parseEncryptionKey(raw: string | undefined | null): Buffer | null {
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === KEY_BYTES ? key : null;
}

export function encryptSecret(plaintext: string, key: Buffer, associatedData: string): EncryptedSecret {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(Buffer.from(associatedData, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

/** Throws when the ciphertext, IV, tag, key or associated data do not match. */
export function decryptSecret(secret: EncryptedSecret, key: Buffer, associatedData: string): string {
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(secret.iv, "base64"), { authTagLength: TAG_BYTES });
  decipher.setAAD(Buffer.from(associatedData, "utf8"));
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(secret.ciphertext, "base64")), decipher.final()]).toString("utf8");
}
