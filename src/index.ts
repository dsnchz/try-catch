export type Success<T> = [error: null, data: T];
export type Failure<E extends Error = Error> = [error: E, data: null];
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Wraps a potentially throwing function or a promise and returns a tuple `[error, data]`.
 * Catches both sync and async errors, and wraps non-Error throws into an `Error` object.
 *
 * ## Examples
 *
 * ```ts
 * // ✅ Synchronous function that may throw
 * const [err, data] = tryCatch(() => JSON.parse("{ \"a\": 1 }"));
 *
 * // ✅ Async function
 * const [err, data] = await tryCatch(async () => fetchData());
 *
 * // ✅ Direct promise
 * const [err, data] = await tryCatch(fetch("/api/data"));
 * ```
 */
/* eslint-disable @typescript-eslint/unified-signatures */
// Overload: Direct Promise
export function tryCatch<T, E extends Error = Error>(input: Promise<T>): Promise<Result<T, E>>;
// Overload: Sync function that returns non-Promise
export function tryCatch<T, E extends Error = Error>(
  input: () => Exclude<T, Promise<unknown>>,
): Result<T, E>;
// Overload: Async function returning Promise
export function tryCatch<T, E extends Error = Error>(
  input: () => Promise<T>,
): Promise<Result<T, E>>;
/* eslint-enable @typescript-eslint/unified-signatures */
// Implementation
export function tryCatch<T, E extends Error = Error>(
  input: (() => T | Promise<T>) | Promise<T>,
): Result<T, E> | Promise<Result<T, E>> {
  // Handle direct promises
  if (input instanceof Promise) {
    return input
      .then((data): Result<T, E> => [null, data])
      .catch((e): Result<T, E> => {
        const error = e instanceof Error ? e : new Error(String(e), { cause: e });
        return [error as E, null];
      });
  }

  // Handle functions
  try {
    const result = input();

    // If result is a promise, handle it asynchronously
    if (result instanceof Promise) {
      return result
        .then((data): Result<T, E> => [null, data])
        .catch((e): Result<T, E> => {
          const error = e instanceof Error ? e : new Error(String(e), { cause: e });
          return [error as E, null];
        });
    }

    // Synchronous result
    return [null, result] as Result<T, E>;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e), { cause: e });
    return [error as E, null];
  }
}
