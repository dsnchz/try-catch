import { describe, expect, it } from "vitest";

import { tryCatch } from "../index";

describe("UTIL FUNCTION: tryCatch", () => {
  // Sync values
  it("handles sync functions that return values", async () => {
    const [err, data] = await tryCatch(() => JSON.parse('{"a":1}'));
    expect(err).toBeNull();
    expect(data).toEqual({ a: 1 });
  });

  it("handles sync function that throws", async () => {
    const [err, data] = await tryCatch(() => JSON.parse("{ a: 1 }")); // invalid JSON (unquoted key)
    expect(err).toBeInstanceOf(SyntaxError);
    expect(err?.message).toContain("JSON Parse error: Expected '}'");
    expect(data).toBeNull();
  });

  it("handles sync functions that throw errors", async () => {
    const [err, data] = await tryCatch(() => {
      throw new RangeError("Out of bounds");
    });
    expect(err).toBeInstanceOf(RangeError);
    expect(err?.message).toBe("Out of bounds");
    expect(data).toBeNull();
  });

  it("handles sync functions that throw non-Error values", async () => {
    const [err, data] = await tryCatch(() => {
      throw "sync oops";
    });
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("sync oops");
    expect(data).toBeNull();
  });

  // Async values

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
