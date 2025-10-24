import type { Result, Something } from "./result.ts";
import type { NullarySomething } from "./wrapping.ts";
import { makeErr } from "./error.ts";
import { makeResultErr, makeResultOk } from "./result.ts";
import { unwrap, wrap, wrapInstanceOf, wrapUnknown } from "./wrapping.ts";
import { describe, expect, it } from "vitest";

class CustomError extends Error {}

class MoreCustomError extends CustomError {}

describe("wrapUnkonwn", () => {
  describe.each([
    {
      // Ensure the higher level `wrap` behaves identically.
      name: "using wrap",
      wrapFunction: <TOk extends Something>(fn: NullarySomething<TOk>) =>
        wrap(fn),
    },
    {
      name: "using wrapUnknown",
      wrapFunction: wrapUnknown,
    },
  ])("$name", ({ wrapFunction }) => {
    it("wraps a successful call in ResultOk", () => {
      const result: Result<string> = wrapFunction(() => "foo");
      expect(result).toEqual({
        isOk: true,
        ok: "foo",
        err: undefined,
      });
    });

    it("wraps a failed (Err) call in ResultErr", () => {
      const result: Result<string> = wrapUnknown(() => {
        throw makeErr("failed");
      });
      expect(result).toEqual({
        isOk: false,
        ok: undefined,
        err: expect.objectContaining({
          message: "failed",
          cause: undefined,
        }),
      });
    });

    it("wraps a failed (junk) call in ResultErr", () => {
      const result: Result<string> = wrapUnknown(() => {
        throw "useless-junk";
      });
      expect(result).toEqual({
        isOk: false,
        ok: undefined,
        err: expect.objectContaining({
          message: "Unknown error",
          cause: {
            error: "useless-junk",
          },
        }),
      });
    });

    it.each([
      new Error("fail"),
      new CustomError("fail"),
      new MoreCustomError("fail"),
    ])("reuses erorr instance", (error) => {
      const result: Result<string> = wrapUnknown(() => {
        throw error;
      });
      expect(result).toEqual({
        isOk: false,
        ok: undefined,
        err: error,
      });
      expect(result.err).toBe(error);
    });
  });
});

describe("wrapInstanceOf", () => {
  describe.each([
    {
      // Ensure the higher level `wrap` behaves identically.
      name: "using wrap",
      wrapFunction: wrap,
    },
    {
      name: "using wrapInstanceOf",
      wrapFunction: wrapInstanceOf,
    },
  ])("$name", ({ wrapFunction }) => {
    it.each([
      false,
      "not what you wanted",
      new Error("ignore me"),
      new CustomError("ignore me too"),
    ])("ignores other errors", (rethrowMe) => {
      const process = () => {
        throw rethrowMe;
      };
      expect(() => wrapFunction(process, MoreCustomError)).toThrow();
    });

    it.each([new CustomError("fail"), new MoreCustomError("more fail")])(
      "wraps matching error",
      (error) => {
        const process = () => {
          throw error;
        };
        const result = wrapFunction(process, CustomError);
        expect(result).toEqual({
          isOk: false,
          ok: undefined,
          err: error,
        });
        expect(result.err).toBeInstanceOf(CustomError);
        expect(result.err).toBe(error);
      },
    );
  });
});

describe("unwrap", () => {
  it.each([undefined, Error])(
    "unwraps a ResultOk to the ok field",
    (constructor) => {
      const ok: string = unwrap(makeResultOk("foo"), constructor);
      expect(ok).toEqual("foo");
    },
  );

  it("unwraps a ResultErr and throws", () => {
    expect(() => unwrap(makeResultErr(makeErr("failed")))).toThrow("failed");
  });

  it.each([Error, CustomError, MoreCustomError])(
    "unwraps a ResultErr and throws an instance of the constructor",
    (constructor) => {
      expect(() =>
        unwrap(makeResultErr(makeErr("failed")), constructor),
      ).toThrow(constructor);
    },
  );
});
