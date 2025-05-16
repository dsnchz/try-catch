type Success<T> = [error: null, data: T];
type Failure<E extends Error = Error> = [error: E, data: null];
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

type SyncFn<T> = () => T;
type AsyncFn<T> = () => Promise<T>;

/**
 * Acceptable input types for `tryCatch`:
 * - A synchronous function that might throw
 * - An async function (returns a promise)
 * - A promise (e.g. from `fetch()`)
 */
type TryCatchInput<T> = SyncFn<T> | AsyncFn<T> | Promise<T>;

/**
 * Wraps a potentially throwing function or a promise and returns a tuple `[error, data]`.
 * Catches both sync and async errors, and wraps non-Error throws into an `Error` object.
 *
 * ## Examples
 *
 * ```ts
 * // ✅ Synchronous function that may throw
 * const [err, data] = await tryCatch(() => JSON.parse("{ \"a\": 1 }"));
 *
 * // ✅ Async function
 * const [err, data] = await tryCatch(() => fetch("/api/data").then(r => r.json()));
 *
 * // ✅ Direct promise
 * const [err, data] = await tryCatch(fetch("/api/data"));
 * ```
 */
export async function tryCatch<T, E extends Error = Error>(
  input: TryCatchInput<T>,
): Promise<Result<T, E>> {
  try {
    const result = typeof input === "function" ? await input() : await input;

    return [null, result];
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e), { cause: e });
    return [error as E, null];
  }
}
