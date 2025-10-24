import type { Err } from "./error";

/**
 * `Something` is used as a generic type constraint, meaning the
 * generic type can be anything other than null or undefined.
 * Deliberately includes primitive types like string.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Something = {};

/**
 * The ok or success variant of the result union.
 * Typically, contains the return value of a
 * function that might have failed.
 *
 * `isOk` is a non-generic discriminator enabling
 * easy type narrowing from a result type even
 * in generic contexts where neither TOk nor
 * TErr is known.
 */
export type ResultOk<TOk extends Something> = {
  isOk: true;
  ok: TOk;
  err: undefined;
};

/**
 * The err or failure variant of the result union.
 * Typically, contains the Error thrown by a
 * function. Or a simpler Err type that
 * structurally resembles an Error but
 * may have never been thrown.
 *
 * `isOk` is a non-generic discriminator enabling
 * easy type narrowing from a result type even
 * in generic contexts where neither TOk nor
 * TErr is known.
 */
export type ResultErr<TErr extends Err = Err> = {
  isOk: false;
  ok: undefined;
  err: TErr;
};

/**
 * A union representing either a successful `ok` value
 * or a failed `err` value.
 *
 * Functions can return result types instead of
 * throwing errors. The presence on ok value
 * means there is no error and vice versa.
 *
 * `isOk` is a non-generic discriminator enabling
 * easy type narrowing from a result type even
 * in generic contexts where neither TOk nor
 * TErr is known.
 */
export type Result<TOk extends Something, TErr extends Err = Err> =
  | ResultOk<TOk>
  | ResultErr<TErr>;

/**
 * Make an ok result indicating the task succeeded.
 */
export function makeResultOk<TOk extends Something>(ok: TOk): ResultOk<TOk> {
  return {
    isOk: true,
    ok,
    err: undefined,
  };
}

/**
 * Create an err result indicating the task failed.
 */
export function makeResultErr<TErr extends Err = Err>(
  err: TErr,
): ResultErr<TErr> {
  return {
    isOk: false,
    ok: undefined,
    err,
  };
}

/**
 * Type guard to narrow any generic Result to any generic ResultOk.
 */
export function isResultOk<TOk extends Something>(
  result: Result<TOk, Err>,
): result is ResultOk<TOk> {
  return result.isOk;
}

/**
 * Type guard to narrow any generic Result to any generic ResultErr.
 */
export function isResultErr<TErr extends Err = Err>(
  result: Result<Something, TErr>,
): result is ResultErr<TErr> {
  return !result.isOk;
}

/**
 * Group a batch of results into oks and errors.
 */
export function groupResults<TOk extends Something, TErr extends Err = Err>(
  results: Result<TOk, TErr>[],
): [TOk[], TErr[]] {
  const oks: TOk[] = [];
  const errs: TErr[] = [];
  for (const result of results) {
    if (result.isOk) {
      oks.push(result.ok);
    } else {
      errs.push(result.err);
    }
  }
  return [oks, errs];
}
