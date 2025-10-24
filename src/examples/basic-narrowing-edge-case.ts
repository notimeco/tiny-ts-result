import type { UUID } from "node:crypto";
import type { Result } from "../result";
import { randomUUID } from "node:crypto";
import { makeResultErr, makeResultOk } from "../result";

/**
 * Load a Result<string, Error>.
 * Use stricter checking (`!== undefined`) to narrow the types.
 */
function example(userId: UUID): void {
  const { ok: user, err } = getUsername(userId);

  // Edge-case.
  // Results for types that can have falsy values like an empty `string` `""`
  // require more care. Only explicit checks for `!== undefined`
  // will narrow the other type.
  if (user !== undefined) {
    handleUsername(user);
    return;
  }

  handleError(err);
}

const joeId = randomUUID();

/**
 * Get a username that might fail.
 */
function getUsername(userId: UUID): Result<string, Error> {
  if (userId === joeId) {
    return makeResultOk("Joe");
  }
  return makeResultErr(new Error("User not found", { cause: { userId } }));
}

/**
 * Do something with a username.
 */
function handleUsername(username: string): void {
  console.log(`Hi ${username}`);
}

/**
 * Do something with an `Error`.
 */
function handleError(error: Error): void {
  console.error(error.message);
}

example(joeId);
example(randomUUID());
