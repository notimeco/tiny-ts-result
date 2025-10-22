import {
  resultOk,
  resultErr,
  isResultOk,
  isResultErr,
  groupResults,
} from "../result";
import type { Result, Something } from "../result";
import type { Err } from "../error";
import { err } from "../error";
import { randomUUID } from "node:crypto";

/**
 * This module serves to both demonstrate some usage scenarios, and
 * to assert what typescript will and won't compile.
 */

/**
 * Destructuring the result type allows for type safe error handling without
 * needing to create a new scope or needing to use nested properties.
 * After the early return typescript narrows the type of `ok`
 * which has been renamed to `user`.
 */
function processResultsWithoutGenerics(userResult: Result<User>): void {
  const { ok: user, err } = userResult;
  if (err !== undefined) {
    logErr(err);
    return;
  }

  // Because TOk and TErr are known (User and Err) typescript is
  // able to narrow one based on the value of the other.
  logUser(user);
}

/**
 * TOk can be a simple primative like string.
 */
function processResultsWithPrimitive({ ok: id, err }: Result<string>): void {
  const oks: string[] = [];
  const errs: Err[] = [];

  if (id) {
    // Positive truthy check proves `id` is `string`
    oks.push(id);
  } else {
    // Negative truthy check doesn't prove anything about `err`.
    // `id` could have been an empty `string` (falsy).
    // @ts-expect-error Demonstrate failed narrowing
    errs.push(err);
  }

  if (!id) {
    // Falsy check can't narrow err because string can also be false.
    // @ts-expect-error Demonstrate failed narrowing
    errs.push(err);
  }

  // String checking (not truthy/falsy) is safest.
  if (err !== undefined) {
    errs.push(err);
    // Early return will narrow the types in the remaining scope.
    return;
  }

  // Because TOk and TErr are known (User and Err) typescript is
  // able to narrow one based on the value of the other.
  oks.push(id);
}

/**
 * Demonstrate some type narrowing limitations.
 *
 * Typescript does not and can not narrow generic types based
 * on control flow analysis. It can narrow the type of the
 * value being checked but if it was generic it will
 * not make inferences about related varaibles.
 *
 * See examples below marked with @ts-expect-error.
 *
 * As a fallback method it's always possible to safely narrow
 * the types with:
 *  - `Result['isOk]` field
 *  - `isResultOk`type guard function
 *  - `isResultErr` type guard function
 */
function processHalfGenericResult<TOk extends Something>(
  result: Result<TOk>,
): void {
  const { isOk, ok, err } = result;

  const oks: TOk[] = [];
  const errs: Err[] = [];

  // Narrowing with either type guard works
  if (isResultOk(result)) {
    oks.push(result.ok);
  } else {
    errs.push(result.err);
  }
  if (isResultErr(result)) {
    errs.push(result.err);
  } else {
    oks.push(result.ok);
  }

  // Narrowing based on regular non generic field `isOk`
  // always works.This is a backup to use whenever
  // the two generic types are unknown.
  if (isOk) {
    oks.push(ok);
  } else {
    errs.push(err);
  }
  // Without destructuring (no change)
  if (result.isOk) {
    oks.push(result.ok);
  } else {
    errs.push(result.err);
  }

  // Narrowing based on default generic type Err works
  if (err === undefined) {
    oks.push(ok);
  } else {
    errs.push(err);
  }
  // Without destructuring (no change)
  if (result.err === undefined) {
    oks.push(result.ok);
  } else {
    errs.push(result.err);
  }

  // Narrowing based on generic type TOk does not work
  if (ok !== undefined) {
    oks.push(ok);
  } else {
    // Ok has been narrowed to !== undefined
    // But err appears to still be referening TOk which is never narrowed by control flow
    //
    // Argument of type 'Err | undefined' is not assignable to parameter of type 'Err'.    Type 'undefined' is not assignable to type 'Err'.
    // @ts-expect-error Demonstrate failed narrowing
    errs.push(err);
  }
  // Without destructuring (no change)
  if (result.ok !== undefined) {
    oks.push(result.ok);
  } else {
    // Argument of type 'Err | undefined' is not assignable to parameter of type 'Err'.    Type 'undefined' is not assignable to type 'Err'.
    // @ts-expect-error Demonstrate failed narrowing
    errs.push(result.err);
  }
}

/*
 * Same scenarios again this time in a loop and also keeping
 * TErr generic instead of using the default type Err.
 */
function processFullyGenericResults<TOk extends Something, TErr extends Err>(
  results: Result<TOk, TErr>[],
): void {
  const oks: TOk[] = [];
  const errs: TErr[] = [];

  for (const result of results) {
    const { isOk, ok, err } = result;

    // Narrowing with either type guard works
    if (isResultOk(result)) {
      oks.push(result.ok);
    } else {
      errs.push(result.err);
    }
    if (isResultErr(result)) {
      errs.push(result.err);
    } else {
      oks.push(result.ok);
    }

    // Narrowing based on regular type isErr works
    if (isOk) {
      oks.push(ok);
    } else {
      errs.push(err);
    }
    // Without destructuring (no change)
    if (result.isOk) {
      oks.push(result.ok);
    } else {
      errs.push(result.err);
    }

    // Narrowing based on default generic type Err works
    if (err === undefined) {
      // `err` has been narrowed to === `undefined`
      // But `ok` appears to still be referening `TErr` which is never narrowed by control flow.
      //
      // Argument of type 'TOk | undefined' is not assignable to parameter of type 'TOk'.    Type 'undefined' is not assignable to type 'TOk'.
      // @ts-expect-error Demonstrate failed narrowing
      oks.push(ok);
    } else {
      errs.push(err);
    }
    // Without destructuring (no change)
    if (result.err === undefined) {
      // `err` has been narrowed to === `undefined`
      // But `ok` appears to still be referening `TErr` which is never narrowed by control flow.
      //
      // Argument of type 'TOk | undefined' is not assignable to parameter of type 'TOk'.    Type 'undefined' is not assignable to type 'TOk'.
      // @ts-expect-error Demonstrate failed narrowing
      oks.push(result.ok);
    } else {
      errs.push(result.err);
    }

    // Narrowing based on generic type TOk does not work
    if (ok !== undefined) {
      oks.push(ok);
    } else {
      // Ok has been narrowed to !== undefined
      // But err appears to still be referening TOk which is never narrowed by control flow
      //
      // Argument of type 'Err | undefined' is not assignable to parameter of type 'Err'.    Type 'undefined' is not assignable to type 'Err'.
      // @ts-expect-error Demonstrate failed narrowing
      errs.push(err);
    }
    // Without destructuring (no change)
    if (result.ok !== undefined) {
      oks.push(result.ok);
    } else {
      // Argument of type 'Err | undefined' is not assignable to parameter of type 'Err'.    Type 'undefined' is not assignable to type 'Err'.
      // @ts-expect-error Demonstrate failed narrowing
      errs.push(result.err);
    }
  }
}

/**
 * Helper to make sure the code is all used and all can run.
 */
export function runExamples(): void {
  processHalfGenericResult(resultOk("hi"));
  processHalfGenericResult(resultErr(err("asdf")));

  processFullyGenericResults([resultOk("hi"), resultErr(err("asdf"))]);

  groupResults([resultOk("hi"), resultErr(err("asdf"))]);

  processResultsWithoutGenerics(getUser());
  processResultsWithoutGenerics(resultErr(err("failed")));

  processResultsWithPrimitive(getId());
  processResultsWithPrimitive(resultErr(err("fail")));
}

type User = {
  id: string;
  name: string;
};

function getUser(): Result<User> {
  return resultOk({
    id: randomUUID(),
    name: "Joe",
  });
}

function getId(): Result<string> {
  return resultOk("my-id");
}

function logErr(err: Err): void {
  console.error(err.message);
}

function logUser(user: User): void {
  console.log(`Hello: ${user.name}`);
}
