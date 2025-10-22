import { describe, expect, it } from "vitest";

describe("index", () => {
  it("exports lib functions", async () => {
    const module = await import("./index.ts");

    expect(module.resultOk).toEqual(expect.any(Function));
    expect(module.resultErr).toEqual(expect.any(Function));
    expect(module.isResultOk).toEqual(expect.any(Function));
    expect(module.isResultErr).toEqual(expect.any(Function));
    expect(module.groupResults).toEqual(expect.any(Function));
    expect(module.err).toEqual(expect.any(Function));
    expect(module.exceptionToErr).toEqual(expect.any(Function));
    expect(module.errToException).toEqual(expect.any(Function));
    expect(module.wrap).toEqual(expect.any(Function));
    expect(module.unwrap).toEqual(expect.any(Function));
  });
});
