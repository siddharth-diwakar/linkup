import { randomBytes } from "crypto";

const JOIN_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const JOIN_CODE_LENGTH = 6;

export function generateJoinCode(length: number = JOIN_CODE_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += JOIN_CODE_CHARS[bytes[i] % JOIN_CODE_CHARS.length];
  }

  return code;
}
