import { describe, expect, it } from "vitest";
import {
  resultOk,
  resultErr,
  isResultOk,
  isResultErr,
  groupResults,
} from "./result";
import type { Result } from "./result";
import type { Err } from "./error";
import { err } from "./error";

describe("resultOk", () => {
  it("makes a ResultOk", () => {
    expect(resultOk("hi")).toEqual({
      isOk: true,
      ok: "hi",
      err: undefined,
    });
  });
});

describe("resultErr", () => {
  it("makes a ResultErr", () => {
    expect(resultErr({ message: "failed" })).toEqual({
      isOk: false,
      ok: undefined,
      err: { message: "failed" },
    });
  });

  it("uses the same Error object unchanged", () => {
    const error = new Error("failed");
    expect(resultErr(error)).toEqual({
      isOk: false,
      ok: undefined,
      err: error,
    });
  });
});

describe("isResultOk", () => {
  it("narrows a Result to a ResultOk", () => {
    const result: Result<string, Err> = resultOk("hi");
    expect(isResultOk(result)).toEqual(true);
  });
});

describe("isResultErr", () => {
  it("narrows a Result to a ResultErr", () => {
    const result: Result<string, Err> = resultErr(err("failed"));
    expect(isResultErr(result)).toEqual(true);
  });
});

describe("groupResults", () => {
  it("groups results into oks and errs", () => {
    const results: Result<string, Err>[] = [
      resultOk("one"),
      resultOk("two"),
      resultOk("three"),
      resultErr(err("failed once")),
      resultErr(err("failed twice")),
      resultErr(err("failed thrice")),
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
