import { describe, expect, it } from "vitest";

describe("index", () => {
  it("exports lib functions", async () => {
    const module = await import("./index.ts");

    expect(module.makeResultOk).toEqual(expect.any(Function));
    expect(module.makeResultErr).toEqual(expect.any(Function));
    expect(module.isResultOk).toEqual(expect.any(Function));
    expect(module.isResultErr).toEqual(expect.any(Function));
    expect(module.groupResults).toEqual(expect.any(Function));
    expect(module.makeErr).toEqual(expect.any(Function));
    expect(module.exceptionToErr).toEqual(expect.any(Function));
    expect(module.errToException).toEqual(expect.any(Function));
    expect(module.wrapUnknown).toEqual(expect.any(Function));
    expect(module.unwrap).toEqual(expect.any(Function));
  });
});
