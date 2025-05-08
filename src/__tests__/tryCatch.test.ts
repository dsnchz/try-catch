import { describe, expect, it } from "vitest";

import { tryCatch } from "../index";

describe("UTIL FUNCTION: tryCatch", () => {
  it("handles resolved promises correctly", async () => {
    const [err, data] = await tryCatch(Promise.resolve(42));
    expect(err).toBeNull();
    expect(data).toBe(42);
  });

  it("handles rejected promises correctly", async () => {
    const error = new Error("Oops!");
    const [err, data] = await tryCatch(Promise.reject(error));
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("Oops!");
    expect(data).toBeNull();
  });

  it("handles successful async functions", async () => {
    const [err, data] = await tryCatch(async () => "done");
    expect(err).toBeNull();
    expect(data).toBe("done");
  });

  it("handles async functions that throw", async () => {
    const [err, data] = await tryCatch(async () => {
      throw new TypeError("Bad input");
    });
    expect(err).toBeInstanceOf(TypeError);
    expect(err?.message).toBe("Bad input");
    expect(data).toBeNull();
  });

  it("wraps non-Error throws into an Error", async () => {
    const [err, data] = await tryCatch(async () => {
      throw "string error";
    });
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("string error");
    expect(data).toBeNull();
  });
});
