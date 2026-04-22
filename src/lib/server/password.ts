import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return {
    salt: salt.toString("base64"),
    hash: hash.toString("base64"),
  };
}

export function verifyPassword(input: {
  password: string;
  salt: string;
  hash: string;
}) {
  const saltBytes = Buffer.from(input.salt, "base64");
  const expectedHash = Buffer.from(input.hash, "base64");
  const actualHash = scryptSync(input.password, saltBytes, expectedHash.length);
  return timingSafeEqual(expectedHash, actualHash);
}
