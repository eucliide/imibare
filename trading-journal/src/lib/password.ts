import { Argon2id } from "oslo/password";

const argon2id = new Argon2id({
  memorySize: 19456,
  iterations: 2,
  parallelism: 1,
});

export async function hashPassword(password: string): Promise<string> {
  return argon2id.hash(password);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2id.verify(hash, password);
  } catch {
    return false;
  }
}
