type Success<T> = [error: null, data: T];
type Failure<E extends Error = Error> = [error: E, data: null];
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Wraps a promise or async function and returns a tuple [error, data].
 * Catches both synchronous and asynchronous errors.
 */
export async function tryCatch<T, E extends Error = Error>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
): Promise<Result<T, E>> {
  try {
    const data = typeof promiseOrFn === "function" ? await promiseOrFn() : await promiseOrFn;

    return [null, data];
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e), { cause: e });
    return [error as E, null];
  }
}
