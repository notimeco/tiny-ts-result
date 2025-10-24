import type { UUID } from "node:crypto";
import type { Result } from "../result";
import { randomUUID } from "node:crypto";
import { makeResultErr, makeResultOk } from "../result";
import { unwrap } from "../wrapping";

class UserError extends Error {}

/**
 * Load a Result<User, Error>.
 *
 * Use unwrap so that it evaluates to a valid User
 * or throws the Error. Use a custom constructor
 * to throw a custom error.
 *
 * Use to ensure a specific instance of error is thrown.
 */
function example(userId: UUID): void {
  // Throws an UserError
  const user = unwrap(getUserResult(userId), UserError);

  handleUser(user);
}

/**
 * The same logic without using `@notimeco/tiny-ts-result`.
 */
function exampleWithoutUsingResult(userId: string): void {
  // Throws an Error
  let user;
  try {
    user = getUserOrThrow(userId);
  } catch (error: unknown) {
    throw new UserError("User error", { cause: error });
  }

  handleUser(user);
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
function handleError(error: unknown): void {
  console.error(error);
}

function runExample(run: () => unknown) {
  try {
    run();
  } catch (error: unknown) {
    handleError(error);
  }
}

runExample(() => example(randomUUID()));
runExample(() => example(joeId));

runExample(() => exampleWithoutUsingResult(randomUUID()));
runExample(() => exampleWithoutUsingResult(joeId));
runExample(() => exampleWithoutUsingResult(""));
