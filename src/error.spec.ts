import type { Err } from "./error";
import { errToException, exceptionToErr, makeErr } from "./error";
import { describe, expect, it } from "vitest";

class Error2 extends Error {}

describe("exceptionToErr", () => {
  it("maps an Error type exception to an Err type", () => {
    const err: Err = exceptionToErr(
      new Error("my error", { cause: { data: 5 } }),
    );
    expect(err).toEqual(
      expect.objectContaining({
        message: "my error",
        cause: { data: 5 },
      }),
    );
  });

  it("reuses thrown Error value as an Err", () => {
    const error = new Error("my error", { cause: { data: 5 } });
    const err: Err = exceptionToErr(error);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBe(error);
  });

  it("reuses thrown Err value as an Err", () => {
    const error = makeErr("my error", { data: 5 });
    const err: Err = exceptionToErr(error);
    expect(err).toBe(error);
  });

  // It's a little upsetting that js allows _anything_ to be thrown.
  it.each([
    "Sometimes I just throw stuff.",
    Promise.resolve("I just throw whatever I want."),
    Symbol("What are you going to do about it?"),
    // Did you think these were Error messages?
    // Why would you think that.
    { message: false },
    { message: 0 },
    { message: [] },
    { message: Symbol("Not a message") },
    undefined,
    null,
    0,
    6_7,
    true,
    [],
    {},
    () => undefined,
    "",
    new Date(),
    /^.*$/,
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new Proxy({}, {}),
    new ArrayBuffer(8),
    new Uint8Array([1, 2, 3]),
    new DataView(new ArrayBuffer(8)),
    new FinalizationRegistry(() => undefined),
    new WeakRef({}),
    Intl.DateTimeFormat,
  ])("maps random nonsense that was thrown to an Err type", (nonsense) => {
    const err = exceptionToErr(nonsense);
    expect(err).toEqual(
      expect.objectContaining({
        message: "Unknown error",
        cause: { error: nonsense },
      }),
    );
  });
});

describe("errToException", () => {
  it("maps an Err to an exception and retains the original Err data", () => {
    const error: Error = errToException(makeErr("my err", { data: 5 }), Error);
    expect(error).toEqual(
      expect.objectContaining({
        message: "my err",
        cause: {
          error: {
            message: "my err",
            cause: { data: 5 },
          },
        },
      }),
    );
  });

  it.each([makeErr("fail"), new Error("fail"), new Error2("fail")])(
    "is always an instace of the given constructor",
    (err) => {
      const error: Error2 = errToException(err, Error2);
      expect(error).toBeInstanceOf(Error2);
    },
  );

  it.each([Error, Error2])(
    "retains Error if instance of constructor",
    (constructor) => {
      // Error2 is an instace of Error2 and also sitll an instance of Error.
      const originalError = new Error2("my real error");
      const error: Error = errToException(originalError, constructor);
      expect(error).toBe(originalError);
    },
  );
});
