/**
 * An Err is slightly smaller than an Error.
 *
 * It is the minimum representation of an error matching
 * the structure of the commonly used Error class.
 *
 * Any typical Error exception can be assigned to an Err.
 * However, an Err doesn't have to come from an Error,
 * it can be as simple as an object with a message.
 *
 * Using plain objects for representing errors avoids
 * the overhead of creating a stack trace, and the
 * pitfalls of Error's non-enumerable properties.
 */
export type Err = {
  message: string;
  cause?: unknown;
};

/**
 * Anything that is not an `Err`.
 *
 * Useful to ensure a generic function cannot be called with an `Err`.
 *
 * Example:
 * ```typescript
 * function <T extends Something>handleNotErr(notErr: NotErr<T>) {}
 * ```
 *
 * Note that Result's TOk doesn't use NotErr to keep TOk as broad
 * as possible. Many valid TOk's would show a false positive as
 * an Err because they also have a `message: string` field.
 */
export type NotErr<T> = T extends Err ? never : T;

/**
 * Make an Err.
 */
export function makeErr(message: string, cause?: unknown): Err {
  return {
    message,
    cause,
  };
}

/**
 * Any constructor function for Err types that can be called with
 * the default arguments for an Error.
 */
export type ErrConstructorDefaultArgs<TError extends Error> = new (
  message: string,
  options: { cause: unknown },
) => TError;

/**
 * Map an Err to an Error using a given constructor to be thrown as an exception.
 *
 * If the err value is already an instance of the provided
 * Error constructor, it is returned unchanged.
 *
 * Otherwise, use the constructor to create a new Error with
 * the previous err included as a property of the cause.
 *
 * Note: This mapping is lossless.
 */
export function errToException<
  TErrorConstructor extends ErrConstructorDefaultArgs<TError>,
  TError extends Error,
>(err: Err, constructor: TErrorConstructor): TError {
  if (err instanceof constructor) {
    return err;
  }
  return new constructor(err.message, { cause: makeCause(err) });
}

/**
 * Map any thrown exception to an Err.
 *
 * If the value is an Error or Err, return it unchanged as the type Err.
 *
 * Otherwise, create a new "Unknown error" Err with the previous error
 * value included as a property of the cause.
 *
 * Note: This mapping is lossless.
 */
export function exceptionToErr(error: unknown): Err {
  if (error instanceof Error || unknownHasMessageField(error)) {
    return error;
  }
  return makeErr("Unknown error", makeCause(error));
}

/**
 * Ensure the cause is always structured the same way.
 */
function makeCause(error: unknown): { error: unknown } {
  return { error };
}

/**
 * Check if this unknown value has string message property.
 * Many error-ish values will have a message while not
 * necessarily extending Error.
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
