import { describe, expect, it } from "vitest";
import { runExamples } from "./examples";

describe("examples", () => {
  it("can run examples", () => {
    expect(runExamples).not.toThrow();
  });
});
