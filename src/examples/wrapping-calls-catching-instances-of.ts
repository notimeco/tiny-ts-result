import type { UUID } from "node:crypto";
import type { Err } from "../error";
import { randomUUID } from "node:crypto";
import { wrap } from "../wrapping";

class ResourceNotFound extends Error {}

/**
 * Wrap a function that throws and return a result type.
 * Will only catch instances of ResourceNotFound. Any
 * other exception will still be thrown.
 *
 * Handle the error case with an early return.
 * Handle the happy case with a type safe User.
 */
function example(userId: UUID): void {
  const { ok: user, err } = wrap(
    () => getUserOrThrow(userId),
    ResourceNotFound,
  );
  if (err) {
    handleError(err);
    return;
  }

  handleUser(user);
}

type User = {
  id: UUID;
  name: string;
};

const joeId = randomUUID();

/**
 * Get a `User` or throw.
 *
 * Typically, this is a function from an external lib
 * or another module still throwing exceptions.
 */
function getUserOrThrow(userId: UUID): User | never {
  if (userId === joeId) {
    return { id: joeId, name: "Joe" };
  }
  throw new ResourceNotFound("User not found", { cause: { userId } });
}

/**
 * Do something with a `User`.
 */
function handleUser(user: User): void {
  console.log(`Hi ${user.name}`);
}

/**
 * Do something with an `Err`.
 */
function handleError(error: Err): void {
  console.error(error.message);
}

example(randomUUID());
example(joeId);
