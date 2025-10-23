import type { Result, Something } from "./result";
import { resultOk, resultErr } from "./result";

/**
 * A function with zero arguments.
 */
type NullaryFunction<TOk extends Something> = () => TOk | never;

/**
 * A constructor for a class extending Err.
 *
 * The arguments are typed never so as to
 * accept any constructur but prevent
 * it from being called.
 */
type ErrorConstructorNeverCalled<TErr extends Err = Err> = new (
  ...args: never[]
) => TErr;

type ErrorConstructor = new (
  message: string,
  options: { cause: unknown },
) => Error;

/**
 * The minimum structure of an Error.
 *
 * Any typical Error exception can be assigned to an Err.
 * However, an Err doesn't have to come from an Error,
 * it can be as simple as an object with a message.
 */
export type Err = {
  message: string;
  cause?: unknown;
};

/**
 * Create a minimal Err.
 */
export function err(message: string, cause?: unknown): Err {
  return {
    message,
    cause,
  };
}

/**
 * Map an exception to an Err type.
 *
 * If the value is an Error, return it unchanged
 * and simply treat it as an Err.
 * Otherwise attempt to extract a suitable message and
 * use any remaining data as the cause to ensure
 * data is never dropped.
 */
export function unknownToErr(error: unknown): Err {
  if (Error.isError(error)) {
    return error;
  }

  // If it's just a string use that as the message.
  if (typeof error === "string" && error.length >= 3) {
    return {
      message: error,
    };
  }

  // Unknown error type.
  return {
    message: unknownHasMessageField(error) ? error.message : "Unknown error",
    cause: { error },
  };
}

/**
 * Check if this unknown value has message property.
 * Many error-ish values will have a message
 * while not necessarily extending Error.
 */
function unknownHasMessageField(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "message" in value &&
    typeof value.message === "string"
  );
}

/**
 * Map an Err to an Error.
 *
 * If the Err was already an Error it is returned as is.
 * Otherwise a new Error is created with the Err data.
 */
export function errToException(err: Err): Error {
  if (Error.isError(err)) {
    return err;
  }
  return new Error(err.message, { cause: err.cause });
}

/**
 * Wrap a callable in a try catch and return a result type.
 * Use to switch from "Exceptions" into "Errors as values".
 *
 * ```typescript
 * const { ok, err } = wrap(() => somethingThatMightThrow());
 * if (err) {
 *   return err;
 * }
 * doSomething(ok);
 * ```
 */
export function wrap<TOk extends Something>(
  fn: NullaryFunction<TOk>,
): Result<TOk, Err> {
  try {
    return resultOk(fn());
  } catch (error: unknown) {
    return resultErr(unknownToErr(error));
  }
}

/**
 * Wrap a callable in a try catch and return a result type where
 * `TErr` is a known family of `Error`. If the caught value
 * doesn't match the provided `Error` constructor it is
 * re-thrown.
 *
 * Useful to deal with external library calls that throw a
 * known family of errors while still refusing to deal
 * with any messy unknown values.
 *
 * No one is interested in a thrown `string` or worse a thrown `Promise`.
 */
export function wrapInstanceOf<TOk extends Something, TErr extends Err>(
  fn: NullaryFunction<TOk>,
  constructor: ErrorConstructorNeverCalled<TErr>,
): Result<TOk, TErr> {
  try {
    return resultOk(fn());
  } catch (error: unknown) {
    // Return _known_ errors as ResultErr.
    // Knowing the constructor means this is an _expected_ error.
    // Expected errors can be responded to locally.
    if (error instanceof constructor) {
      return resultErr(error);
    }
    // Throw anything that is _unknown_.
    // Not knowing the constructor means this is an _unexpected_ error.
    // Not much can be done with unexpected error; they can go
    // to a top level error handler.
    throw error;
  }
}

/**
 * Return either the ok result or throw a specific Error type.
 *
 * Use to switch from "Errors as values" back to "Exceptions".
 * Always creates a new exception using the given constructor
 * using the TErr type as the cause so no data is lost.
 *
 * Useful when wanting to ensure a specific sub-type of Error
 * is thrown and the original Error type doesn't matter.
 *
 * ```typescript
 * const ok = unwrap(getResult());
 * ````
 */
export function unwrap<TOk extends Something>(
  { isOk, ok, err }: Result<TOk, Err>,
  errorConstructor: ErrorConstructor = Error,
): TOk | never {
  if (isOk) {
    return ok;
  }

  if (err instanceof errorConstructor) {
    throw err;
  }

  throw new errorConstructor(err.message, { cause: err.cause });
}
