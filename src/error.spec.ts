import { describe, expect, it } from "vitest";
import type { Result } from "./result";
import { resultOk, resultErr } from "./result";
import { errToException, unknownToErr, err, wrap, unwrap } from "./error";
import type { Err } from "./error";

describe("exceptionToErr", () => {
  it("maps an exception to an Err type", () => {
    const err = unknownToErr(new Error("my error", { cause: { data: 5 } }));
    expect(err).toEqual(
      expect.objectContaining({
        message: "my error",
        cause: { data: 5 },
      }),
    );
  });

  it("mapped exception is both Err type and Error class", () => {
    const err: Err = unknownToErr(
      new Error("my error", { cause: { data: 5 } }),
    );
    expect(err).toBeInstanceOf(Error);
  });

  it("maps a string to an Err using it as the message", () => {
    const err = unknownToErr("foo");
    expect(err).toEqual(
      expect.objectContaining({
        message: "foo",
      }),
    );
  });

  it.each([true, 0, Promise.resolve()])(
    "maps random nonsense that was thrown to an Err type",
    (nonsense) => {
      const err = unknownToErr(nonsense);
      expect(err).toEqual(
        expect.objectContaining({
          message: "Unknown error",
          cause: { error: nonsense },
        }),
      );
    },
  );
});

describe("errToException", () => {
  it("maps an Err to an exception", () => {
    const error = errToException(err("my err", { data: 5 }));
    expect(error).toEqual(
      expect.objectContaining({
        message: "my err",
        cause: { data: 5 },
      }),
    );
  });
});

describe("wrap", () => {
  it("wraps a successful closure in ResultOk", () => {
    const result: Result<string, Err> = wrap(() => "foo");
    expect(result).toEqual({
      isOk: true,
      ok: "foo",
      err: undefined,
    });
  });

  it("wraps a failed closure in ResultErr", () => {
    const result: Result<string, Err> = wrap(() => {
      throw new Error("failed");
    });
    expect(result).toEqual({
      isOk: false,
      ok: undefined,
      err: expect.objectContaining({
        message: "failed",
      }),
    });
  });
});

describe("unwrap", () => {
  it("unwraps a ResultOk to the ok field", () => {
    const ok: string = unwrap(resultOk("foo"));
    expect(ok).toEqual("foo");
  });

  it("unwraps a ResultErr and throws", () => {
    expect(() => unwrap(resultErr(err("failed")))).toThrow("failed");
  });
});
