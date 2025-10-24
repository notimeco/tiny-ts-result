import type { Err, NotErr } from "../error";
import type { Result, Something } from "../result";
import { isResultOk, makeResultErr, makeResultOk } from "../result";

/**
 * Process a generic result.
 *
 * Use `Result.isOk` discriminator field to narrow types.
 * Use `isResultOk(result)` type guard to narrow types.
 */
function example<TOk extends Something, TErr extends Err>(
  result: Result<NotErr<TOk>, TErr>,
): void {
  // With destructuring.
  const { isOk, ok, err } = result;
  if (isOk) {
    handleOk(ok);
  } else {
    handleErr(err);
  }

  // With type guard.
  if (isResultOk(result)) {
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
