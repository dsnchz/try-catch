import { describe, expect, test } from "vitest";

import { tryCatch } from "../index";

describe("UTIL FUNCTION: tryCatch", () => {
  // Sync values
  test("handles sync functions that return values", () => {
    const [err, data] = tryCatch(() => JSON.parse('{"a":1}'));
    expect(err).toBeNull();
    expect(data).toEqual({ a: 1 });
  });

  test("handles sync functions with typed return values", () => {
    const [err, data] = tryCatch(() => 42);
    expect(err).toBeNull();
    expect(data).toBe(42);
  });

  test("handles sync function that throws", () => {
    const [err, data] = tryCatch(() => JSON.parse("{ a: 1 }")); // invalid JSON (unquoted key)
    expect(err).toBeInstanceOf(SyntaxError);
    expect(err?.message).toContain("JSON Parse error: Expected '}'");
    expect(data).toBeNull();
  });

  test("handles sync functions that throw errors", () => {
    const [err, data] = tryCatch(() => {
      throw new RangeError("Out of bounds");
    });
    expect(err).toBeInstanceOf(RangeError);
    expect(err?.message).toBe("Out of bounds");
    expect(data).toBeNull();
  });

  test("handles sync functions that throw non-Error values", () => {
    const [err, data] = tryCatch(() => {
      throw "sync oops";
    });
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("sync oops");
    expect(data).toBeNull();
  });

  // Async values
  test("handles resolved promises correctly", async () => {
    const [err, data] = await tryCatch(Promise.resolve(42));
    expect(err).toBeNull();
    expect(data).toBe(42);
  });

  test("handles rejected promises correctly", async () => {
    const error = new Error("Oops!");
    const [err, data] = await tryCatch(Promise.reject(error));
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("Oops!");
    expect(data).toBeNull();
  });

  test("handles sync functions returning rejected promises", async () => {
    const [err, data] = await tryCatch(() => Promise.reject(new Error("rejected")));
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("rejected");
    expect(data).toBeNull();
  });

  test("handles successful async functions", async () => {
    const [err, data] = await tryCatch(async () => "done");
    expect(err).toBeNull();
    expect(data).toEqual("done");
  });

  test("handles async functions that throw", async () => {
    const [err, data] = await tryCatch(async () => {
      throw new TypeError("Bad input");
    });
    expect(err).toBeInstanceOf(TypeError);
    expect(err?.message).toBe("Bad input");
    expect(data).toBeNull();
  });

  test("wraps non-Error throws into an Error", async () => {
    const [err, data] = await tryCatch(async () => {
      throw "string error";
    });
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe("string error");
    expect(data).toBeNull();
  });

  test("handles functions returning promise chains", async () => {
    const [err, data] = await tryCatch(() => Promise.resolve(10).then((x) => x * 2));
    expect(err).toBeNull();
    expect(data).toBe(20);
  });
});
