import type { UUID } from "node:crypto";
import type { Result } from "../result";
import { randomUUID } from "node:crypto";
import { groupResults, makeResultErr, makeResultOk } from "../result";

/**
 * Load a batch of Result<User, Error>.
 * Handle all the errors.
 * Handle all the users.
 */
function example(userIds: UUID[]): void {
  const [users, errs] = groupResults(userIds.map(getUserResult));

  errs.map(handleError);
  users.map(handleUser);
}

/**
 * The same logic without using `@notimeco/tiny-ts-result`.
 */
function exampleWithoutUsingResult(userIds: string[]): void {
  for (const userId of userIds) {
    // Have to use let because user isn't assigned until in the
    // try scope
    let user: User;
    try {
      // Can only use const here if the remaining logic
      // also is inside the try block. Eventually
      // the try block is filled with unrelated
      // statements.
      user = getUserOrThrow(userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleError(error);
        continue;
      }

      // Handle the error again in case it wasn't an Error.
      handleError(new Error("Unknown error", { cause: error }));
      continue;
    }

    handleUser(user);
  }
}

type User = {
  id: UUID;
  name: string;
};

const joeId = randomUUID();

/**
 * Get a `User` that might fail.
 */
function getUserResult(userId: UUID): Result<User, Error> {
  if (userId === joeId) {
    return makeResultOk({ id: joeId, name: "Joe" });
  }
  return makeResultErr(new Error("User not found", { cause: { userId } }));
}

/**
 * Get a `User` or throw.
 */
function getUserOrThrow(userId: string): User | never {
  if (!userId) {
    throw "not an error";
  }
  if (userId === joeId) {
    return { id: joeId, name: "Joe" };
  }
  throw new Error("User not found", { cause: { userId } });
}

/**
 * Do something with a `User`.
 */
function handleUser(user: User): void {
  console.log(`Hi ${user.name}`);
}

/**
 * Do something with an `Error`.
 */
function handleError(error: Error): void {
  console.error(error.message);
}

example([randomUUID(), joeId]);

exampleWithoutUsingResult([randomUUID(), joeId, ""]);
