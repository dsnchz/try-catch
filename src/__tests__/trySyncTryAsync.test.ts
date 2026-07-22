import { describe, expect, test } from "bun:test";

import { tryAsync, tryCatch, trySync } from "../index";

describe("trySync", () => {
  test("returns data on success", () => {
    const [err, data] = trySync(() => 42);
    expect(err).toBeNull();
    expect(data).toBe(42);
  });

  test("returns wrapped error on throw", () => {
    const [err, data] = trySync(() => {
      throw new Error("boom");
    });
    expect(err?.message).toBe("boom");
    expect(data).toBeNull();
  });

  test("NEVER mode-switches: a promise-valued result is the data", () => {
    const p = Promise.resolve(1);
    const result = trySync(() => p);
    // synchronous tuple, promise as data — not a Promise<Result>
    expect(Array.isArray(result)).toBe(true);
    const [err, data] = result;
    expect(err).toBeNull();
    expect(data).toBe(p);
  });

  test("does not catch a rejected promise value (it has not rejected synchronously)", async () => {
    const p = Promise.reject(new Error("later"));
    const [err, data] = trySync(() => p);
    expect(err).toBeNull();
    expect(data).toBe(p);
    await p.catch(() => undefined); // silence unhandled rejection
  });

  test("finally runs on success and on failure", () => {
    let calls = 0;
    trySync(() => 1, { finally: () => calls++ });
    trySync(
      () => {
        throw new Error("x");
      },
      { finally: () => calls++ },
    );
    expect(calls).toBe(2);
  });

  test("finally throw REPLACES the result (native semantics)", () => {
    const [err, data] = trySync(() => 42, {
      finally: () => {
        throw new Error("cleanup failed");
      },
    });
    expect(err?.message).toBe("cleanup failed");
    expect(data).toBeNull();
  });
});

describe("tryAsync", () => {
  test("uniform shape for promise, sync fn, and async fn", async () => {
    expect(await tryAsync(Promise.resolve(1))).toEqual([null, 1]);
    expect(await tryAsync(() => 2)).toEqual([null, 2]);
    expect(await tryAsync(async () => 3)).toEqual([null, 3]);
  });

  test("wraps rejections and throws", async () => {
    const [err1] = await tryAsync(Promise.reject(new Error("r")));
    expect(err1?.message).toBe("r");
    const [err2] = await tryAsync(() => {
      throw new Error("t");
    });
    expect(err2?.message).toBe("t");
  });

  test("wraps non-Error throws with cause", async () => {
    const [err] = await tryAsync(() => Promise.reject("plain"));
    expect(err).toBeInstanceOf(Error);
    expect(err?.cause).toBe("plain");
  });

  test("finally is awaited before the Result resolves", async () => {
    const order: string[] = [];
    const result = await tryAsync(async () => "data", {
      finally: async () => {
        await new Promise((r) => setTimeout(r, 10));
        order.push("finally");
      },
    });
    order.push("result");
    expect(order).toEqual(["finally", "result"]);
    expect(result).toEqual([null, "data"]);
  });

  test("finally rejection REPLACES the result", async () => {
    const [err, data] = await tryAsync(async () => 1, {
      finally: async () => {
        throw new Error("cleanup failed");
      },
    });
    expect(err?.message).toBe("cleanup failed");
    expect(data).toBeNull();
  });
});

describe("tryCatch finally option", () => {
  test("sync path: runs on success and failure, throw replaces", () => {
    let calls = 0;
    expect(tryCatch(() => 1, { finally: () => calls++ })).toEqual([null, 1]);
    const [err] = tryCatch(
      () => {
        throw new Error("x");
      },
      { finally: () => calls++ },
    );
    expect(err?.message).toBe("x");
    expect(calls).toBe(2);

    const [replaced] = tryCatch(() => 1, {
      finally: () => {
        throw new Error("cleanup failed");
      },
    });
    expect(replaced?.message).toBe("cleanup failed");
  });

  test("async path: finally awaited, rejection replaces", async () => {
    const order: string[] = [];
    const result = await tryCatch(Promise.resolve("ok"), {
      finally: async () => {
        await new Promise((r) => setTimeout(r, 5));
        order.push("finally");
      },
    });
    order.push("result");
    expect(order).toEqual(["finally", "result"]);
    expect(result).toEqual([null, "ok"]);

    const [err] = await tryCatch(async () => 1, {
      finally: () => {
        throw new Error("cleanup failed");
      },
    });
    expect(err?.message).toBe("cleanup failed");
  });
});
