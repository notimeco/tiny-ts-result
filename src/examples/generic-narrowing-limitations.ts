import type { Err, NotErr } from "../error";
import type { Result, Something } from "../result";
import { makeResultErr, makeResultOk } from "../result";

/**
 * Demonstrate limitations when narrowing generic results.
 *
 * Fail to narrow `err` by checking the type of `ok`.
 * Fail to narrow `ok` by checking the type of `err`.
 *
 * Succeed in narrowing using the non-generic discriminator `isOk`.
 */
function example<TOk extends Something, TErr extends Err>(
  result: Result<NotErr<TOk>, TErr>,
): void {
  // With object destructuring.
  const { ok, err } = result;
  if (ok !== undefined) {
    // The variable that was directly checked is narrowed as normal.
    handleOk(ok);
  } else {
    // Typescript cannot narrow types based on a related generic type.
    // `ok` has been narrowed but `err` is still linked to
    // the original `TOk` which has not been narrowed.
    //
    // Typescript error:
    // Argument of type 'TErr | undefined' is not assignable to parameter of type 'Err'. Type 'undefined' is not assignable to type 'Err'.
    // @ts-expect-error Demonstrating narrowing limitation
    handleErr(err);
  }

  //
  // With object property checking
  if (result.err === undefined) {
    // Typescript cannot narrow types based on a related generic type.
    // `ok` has been narrowed but `err` is still linked to
    // the original `TOk` which has not been narrowed.
    //
    // Typescript error:
    // Argument of type 'NotErr<TOk> | undefined' is not assignable to parameter o      f type 'Something'. Type 'undefined' is not assignable to type 'Something'.
    // @ts-expect-error Demonstrating narrowing limitation
    handleOk(result.ok);
  } else {
    // The variable that was directly checked is narrowed as normal.
    handleErr(result.err);
  }

  // Using the discriminator field `isOk` will always work because it's not generic.
  if (result.isOk) {
    handleOk(result.ok);
  } else {
    handleErr(result.err);
  }
}

/**
 * Do something with a generic ok result.
 */
function handleOk<TOk extends Something>(ok: NotErr<TOk>): void {
  console.log(ok);
}

/**
 * Do something with a generic err result.
 */
function handleErr<TErr extends Err>(err: TErr): void {
  console.error(err);
}

example(makeResultOk("I could be anything."));
example(makeResultErr(new Error("But I'm not.")));
