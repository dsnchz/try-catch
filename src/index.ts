/* eslint-disable @typescript-eslint/unified-signatures */
export type Success<T> = [error: null, data: T];
export type Failure<E extends Error = Error> = [error: E, data: null];
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Wraps a promise and returns a tuple `[error, data]`.
 *
 * @template T - The resolved type of the promise
 * @template E - The error type, defaults to `Error`
 * @param input - A promise to wrap
 * @returns A promise resolving to `[null, data]` on success or `[error, null]` on failure
 *
 * @example
 * ```ts
 * const [err, data] = await tryCatch(fetch("/api/data"));
 * ```
 */
export function tryCatch<T, E extends Error = Error>(input: Promise<T>): Promise<Result<T, E>>;
/**
 * Wraps a synchronous function and returns a tuple `[error, data]`.
 *
 * @template T - The return type of the function
 * @template E - The error type, defaults to `Error`
 * @param input - A synchronous function that may throw
 * @returns `[null, data]` on success or `[error, null]` on failure
 *
 * @example
 * ```ts
 * const [err, data] = tryCatch(() => JSON.parse('{"a":1}'));
 * ```
 */
export function tryCatch<T, E extends Error = Error>(
  input: () => Exclude<T, Promise<unknown>>,
): Result<T, E>;
/**
 * Wraps an async function and returns a tuple `[error, data]`.
 *
 * @template T - The resolved type of the returned promise
 * @template E - The error type, defaults to `Error`
 * @param input - An async function or a function returning a promise
 * @returns A promise resolving to `[null, data]` on success or `[error, null]` on failure
 *
 * @example
 * ```ts
 * const [err, data] = await tryCatch(async () => fetchData());
 * ```
 */
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
