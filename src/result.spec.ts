import type { Err } from "./error";
import type { Result } from "./result";
import { makeErr } from "./error";
import {
  groupResults,
  isResultErr,
  isResultOk,
  makeResultErr,
  makeResultOk,
} from "./result";
import { describe, expect, it } from "vitest";

describe("resultOk", () => {
  it("makes a ResultOk", () => {
    expect(makeResultOk("hi")).toEqual({
      isOk: true,
      ok: "hi",
      err: undefined,
    });
  });
});

describe("resultErr", () => {
  it("makes a ResultErr", () => {
    expect(makeResultErr({ message: "failed" })).toEqual({
      isOk: false,
      ok: undefined,
      err: { message: "failed" },
    });
  });

  it("uses the same Error object unchanged", () => {
    const error = new Error("failed");
    expect(makeResultErr(error)).toEqual({
      isOk: false,
      ok: undefined,
      err: error,
    });
  });
});

describe("isResultOk", () => {
  it("narrows a Result to a ResultOk", () => {
    const result: Result<string, Err> = makeResultOk("hi");
    expect(isResultOk(result)).toEqual(true);
  });
});

describe("isResultErr", () => {
  it("narrows a Result to a ResultErr", () => {
    const result: Result<string, Err> = makeResultErr(makeErr("failed"));
    expect(isResultErr(result)).toEqual(true);
  });
});

describe("groupResults", () => {
  it("groups results into oks and errs", () => {
    const results: Result<string, Err>[] = [
      makeResultOk("one"),
      makeResultOk("two"),
      makeResultOk("three"),
      makeResultErr(makeErr("failed once")),
      makeResultErr(makeErr("failed twice")),
      makeResultErr(makeErr("failed thrice")),
    ];

    const [messages, errors] = groupResults(results);

    expect(messages).toEqual(["one", "two", "three"]);
    expect(errors).toEqual([
      {
        message: "failed once",
        cause: undefined,
      },
      {
        message: "failed twice",
        cause: undefined,
      },
      {
        message: "failed thrice",
        cause: undefined,
      },
    ]);
  });
});
