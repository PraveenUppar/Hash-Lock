import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  // Argon2 handles salting automatically and is resistant to GPU attacks
  return await argon2.hash(password);
};

export const verifyPassword = async (
  hash: string,
  plain: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch (e) {
    // In case of error, return false rather than crashing
    return false;
  }
};
