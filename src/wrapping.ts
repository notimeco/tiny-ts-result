import type { Err, ErrConstructorDefaultArgs } from "./error.ts";
import type { Result, Something } from "./result.ts";
import { errToException, exceptionToErr } from "./error.ts";
import { makeResultErr, makeResultOk } from "./result.ts";

/**
 * Any function that takes zero arguments and returns something.
 * The `never` variant in the return hints that it might throw.
 */
export type NullarySomething<TOk extends Something> = () => TOk | never;

/**
 * Filter a generic Err type based on possibly having an Error constructor.
 * If the constructor is undefined just default to Err otherwise use
 * the return type of the provided constructor.
 */
export type FilterErr<T extends undefined | ErrConstructorNeverCall> =
  T extends ErrConstructorNeverCall<infer IErr> ? IErr : Err;

/**
 * Any constructor function for Err types. Used only for `instanceof`
 * type checks and return type inference.
 *
 * This type is *never called* at runtime. The constructor arguments
 * are typed as `never[]` because different `Err` constructors
 * may have incompatible signatures, making invocation
 * unsafe in generic contexts.
 *
 * Note: All Err constructors are also Error constructors.
 */
export type ErrConstructorNeverCall<TErr extends Err = Err> = new (
  ...args: never[]
) => TErr;

/**
 * Run any function that might throw and return a result type.
 * Thrown exceptions are caught and returned as ResultErr.
 *
 * Optionally provide an error constructor to only wrap
 * instances of that constructor. Other unknown values
 * are rethrown.
 *
 * `TErr` of the resturned result is either the base Err
 * if no constructor was provided or, if provided, the
 * type of that constructor. Use this to catch only
 * a known family of `Error`.
 *
 * Useful to deal with external library calls that throw a
 * known family of errors while still refusing to deal
 * with any messy unknown values.
 *
 * Wrap all calls to external functions that throw to
 * create an exception free area.
 *
 * Use to switch from _Exceptions_ into _Errors as values_.
 *
 * Note:
 *
 * This function contains some casts. Special care has
 * been taken to ensure the casts are correct and
 * justified based on typescript's inability to
 * narrow generic type parameters with
 * control flow analysis.
 *
 * The implementation is as simple as possible
 * only delgating to external functions that
 * themselves do not have casts.
 *
 * To avoid relying on casting simply call the delgates directly:
 * - `wrapUnknown(fn)`
 * - `wrapInstanceOf(fn, onlyInstanceOf)`
 *
 * ```typescript
 * const { ok: user, err } = wrap(() => getUser(userId), DatabaseError);
 * if (err) {
 *   console.log(err.message, { port: err.port });
 *   return;
 * }
 * console.log(user.name);
 * ```
 */
export function wrap<
  TOk extends Something,
  TOnlyInstaceOf extends undefined | ErrConstructorNeverCall<TErr>,
  TErr extends Err,
>(
  fn: NullarySomething<TOk>,
  onlyInstanceOf?: TOnlyInstaceOf,
): Result<TOk, FilterErr<TOnlyInstaceOf>> {
  if (onlyInstanceOf !== undefined) {
    // Prove that the result is assignable to the epxected
    // return type when onlyInstanceOf is defined.
    //
    // If a filtering constructor is given, only exceptions
    // that are instances of that constructor are caught.
    // Everything else will rethrow.
    const result: Result<TOk, TErr> = wrapInstanceOf(fn, onlyInstanceOf);

    // Cast back to the generic return type becasuse typescript
    // is not capable of narrowing generic type parameters
    // with control flow analysis.
    // i.e. narrowing onlyInstanceOf with an if statement
    // doesn't narrow the expected return type.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return result as Result<TOk, FilterErr<TOnlyInstaceOf>>;
  }

  // Prove that the result is assignable to the epxected
  // return type when onlyInstanceOf is undefined.
  // If no filtering constructor is given TErr
  // will default to Err.
  const result: Result<TOk> = wrapUnknown(fn);

  // Cast back to the generic return type becasuse typescript
  // is not capable of narrowing generic type parameters
  // with control flow analysis.
  // i.e. narrowing onlyInstanceOf with an if statement
  // doesn't narrow the expected return type.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return result as Result<TOk, FilterErr<TOnlyInstaceOf>>;
}

/**
 * Run any function that might throw and return a result type.
 * Thrown exceptions are caught and returned as ResultErr.
 *
 * Useful to deal with external library calls that might
 * throw anything.
 *
 * Wrap all calls to external functions that throw to
 * create an exception free area.
 *
 * Use to switch from _Exceptions_ into _Errors as values_.
 *
 * ```typescript
 * const { ok: user, err } = wrap(() => getUser(userId));
 * if (err) {
 *   console.log(err.message);
 *   return;
 * }
 * console.log(user.name);
 * ```
 */
export function wrapUnknown<TOk extends Something>(
  fn: NullarySomething<TOk>,
): Result<TOk> {
  try {
    return makeResultOk(fn());
  } catch (error: unknown) {
    return makeResultErr(exceptionToErr(error));
  }
}

/**
 * Run any function that might throw and return a result type.
 * Thrown exceptions are caught and returned as ResultErr.
 *
 * Useful to deal with external library calls that throw a
 * known family of errors while still refusing to deal
 * with any messy unknown values.
 *
 * Wrap all calls to external functions that throw to
 * create an exception free area.
 *
 * Only instances of the provided constructor are caught
 * Anything else is rethrown.
 *
 * `TErr` of the resturned result is, the type of the
 * constructor. Use this to catch only a known
 * family of `Error`.
 *
 * Use to switch from _Exceptions_ into _Errors as values_.
 *
 * ```typescript
 * const { ok: user, err } = wrap(() => getUser(userId), DatabaseError);
 * if (err) {
 *   console.log(err.message, { port: err.port });
 *   return;
 * }
 * console.log(user.name);
 * ```
 */
export function wrapInstanceOf<TOk extends Something, TErr extends Err>(
  fn: NullarySomething<TOk>,
  constructor: ErrConstructorNeverCall<TErr>,
): Result<TOk, TErr> {
  try {
    return makeResultOk(fn());
  } catch (error: unknown) {
    // Return _known_ errors as ResultErr.
    // Knowing the constructor means this is an _expected_ error.
    // Expected errors can be responded to locally.
    if (error instanceof constructor) {
      return makeResultErr(error);
    }
    // Throw anything that is _unknown_.
    // Not knowing the constructor means this is an _unexpected_ error.
    // Not much can be done with unexpected error; they can go
    // to a top level error handler.
    throw error;
  }
}

/**
 * Return either the ok result or throw an Error.
 *
 * Use to switch from "Errors as values" back to "Exceptions".
 *
 * Optionally provide an error constructor that uses the
 * default arguments to create the new thrown error.
 * By default the Error constructor is used.
 *
 * If there is an err and the type is already an instance
 * of the constructor, then it will be thrown unchanged.
 * Else it will create a new Error from simple Err data.
 *
 * Useful when no meaningful error handling can take
 * place in the current context and it's best to
 * throw back to a top level error handler.
 *
 * ```typescript
 * const user: User = unwrap(getUserResult());
 * ```
 */
export function unwrap<TOk extends Something, TError extends Error>(
  { isOk, ok, err }: Result<TOk>,
  errorConstructor?: ErrConstructorDefaultArgs<TError>,
): TOk | never {
  if (isOk) {
    return ok;
  }
  throw errToException(err, errorConstructor || Error);
}
