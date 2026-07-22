---
"@dschz/try-catch": minor
---

Add `trySync`, `tryAsync`, and a `finally` option (`TryOptions`) on all wrappers.

- `trySync(fn, options?)` — explicitly synchronous: never switches to the promise
  branch; a promise-valued result is the data. For call sites where the caller must
  dictate the shape and thenable values must not change control flow.
- `tryAsync(input, options?)` — explicitly asynchronous: promise, sync fn, or async
  fn in, always `Promise<Result>` out.
- `options.finally` — runs after the input settles with native `try/finally`
  semantics (a throwing callback replaces the result); awaited on async paths.
