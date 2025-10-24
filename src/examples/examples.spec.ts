import { describe, expect, it } from "vitest";

describe("examples", () => {
  it("can run example modules", async () => {
    await expect(import("./basic-narrowing.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(import("./basic-narrowing-batch.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(import("./basic-narrowing-edge-case.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(import("./generic-narrowing.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(import("./generic-narrowing-limitations.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(
      import("./wrapping-calls-catching-all-exceptions.ts"),
    ).resolves.toEqual(expect.any(Object));
    await expect(
      import("./wrapping-calls-catching-instances-of.ts"),
    ).resolves.toEqual(expect.any(Object));
    await expect(import("./unwrapping-exceptions.ts")).resolves.toEqual(
      expect.any(Object),
    );
    await expect(import("./unwrapping-custom-exceptions.ts")).resolves.toEqual(
      expect.any(Object),
    );
  });
});
