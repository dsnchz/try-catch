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
export function tryCatch<T, E extends Error = Error>(
  input: Promise<T>,
  options?: TryOptions,
): Promise<Result<T, E>>;
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
  options?: TryOptions,
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
  options?: TryOptions,
): Promise<Result<T, E>>;
/* eslint-enable @typescript-eslint/unified-signatures */
// Implementation
export function tryCatch<T, E extends Error = Error>(
  input: (() => T | Promise<T>) | Promise<T>,
  options?: TryOptions,
): Result<T, E> | Promise<Result<T, E>> {
  // Handle direct promises
  if (input instanceof Promise) {
    return tryAsync<T, E>(input, options);
  }

  // Handle functions
  try {
    const result = input();

    // If result is a promise, handle it asynchronously
    if (result instanceof Promise) {
      return tryAsync<T, E>(result, options);
    }

    // Synchronous result: apply finally with native try/finally semantics
    if (options?.finally) {
      try {
        void options.finally();
      } catch (e) {
        return asFailure<T, E>(e);
      }
    }
    return [null, result] as Result<T, E>;
  } catch (e) {
    const result = asFailure<T, E>(e);
    if (options?.finally) {
      try {
        void options.finally();
      } catch (e2) {
        return asFailure<T, E>(e2);
      }
    }
    return result;
  }
}

/** Options accepted by all wrappers. */
export type TryOptions = {
  /**
   * Runs after the wrapped input settles, success or failure — the `finally` clause.
   * Matches native `try/finally` semantics: if the callback itself throws, its error
   * REPLACES the result (you get `[callbackError, null]`). The return value is
   * otherwise ignored, except that on the async paths a returned promise is awaited
   * before the Result resolves; on the sync paths a returned promise is not awaited
   * (a sync shape cannot wait), but a synchronous throw still replaces the result.
   */
  finally?: () => unknown;
};

const asFailure = <T, E extends Error>(e: unknown): Result<T, E> => {
  const error = e instanceof Error ? e : new Error(String(e), { cause: e });
  return [error as E, null];
};

/**
 * Explicitly synchronous variant of {@link tryCatch}: runs the function, catches, and
 * returns a `Result` tuple — and NEVER switches to the promise branch. If the function
 * returns a promise, the promise itself is the data (`[null, promise]`): synchronously,
 * that IS the value. Use this where the caller must dictate the shape and a
 * thenable-valued result must not change the control flow (e.g. reading values that may
 * legally hold promises).
 *
 * @template T - The return type of the function
 * @template E - The error type, defaults to `Error`
 * @param input - A synchronous function that may throw
 * @param options - Optional {@link TryOptions}
 * @returns `[null, data]` on success or `[error, null]` on failure — always synchronously
 *
 * @example
 * ```ts
 * const [err, value] = trySync(() => readMaybeAsyncProp());
 * ```
 */
export function trySync<T, E extends Error = Error>(
  input: () => T,
  options?: TryOptions,
): Result<T, E> {
  let result: Result<T, E>;
  try {
    result = [null, input()];
  } catch (e) {
    result = asFailure<T, E>(e);
  }
  if (options?.finally) {
    try {
      void options.finally();
    } catch (e) {
      return asFailure<T, E>(e);
    }
  }
  return result;
}

/**
 * Explicitly asynchronous variant of {@link tryCatch}: accepts a promise, a sync
 * function, or an async function, and ALWAYS returns `Promise<Result>` — one uniform
 * shape for callers in async pipelines, regardless of what the input turns out to be.
 *
 * @template T - The resolved data type
 * @template E - The error type, defaults to `Error`
 * @param input - A promise, or a function returning a value or promise
 * @param options - Optional {@link TryOptions} (the `finally` callback is awaited)
 * @returns A promise resolving to `[null, data]` or `[error, null]`
 *
 * @example
 * ```ts
 * const [err, data] = await tryAsync(() => maybeSyncMaybeAsync());
 * ```
 */
export async function tryAsync<T, E extends Error = Error>(
  input: (() => T | Promise<T>) | Promise<T>,
  options?: TryOptions,
): Promise<Result<T, E>> {
  let result: Result<T, E>;
  try {
    const data = input instanceof Promise ? await input : await input();
    result = [null, data];
  } catch (e) {
    result = asFailure<T, E>(e);
  }
  if (options?.finally) {
    try {
      await options.finally();
    } catch (e) {
      return asFailure<T, E>(e);
    }
  }
  return result;
}
