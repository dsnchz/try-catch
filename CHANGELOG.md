# @dschz/try-catch

## 1.2.2

### Patch Changes

- Fixes broken CI and updates readme

## 1.2.1

### Patch Changes

- Address CI lint issues

## 1.2.0

### Minor Changes

**Refined synchronous execution support** - `tryCatch` now returns the appropriate type based on input, eliminating unnecessary `await` for synchronous functions.

#### Supported Use Cases

**Synchronous functions** - No `await` needed, returns `Result<T, E>` directly:

```ts
// Parse JSON
const [err, data] = tryCatch(() => JSON.parse('{"a":1}'));

// Functions that throw
const [err, data] = tryCatch(() => {
  throw new RangeError("Out of bounds");
});

// Non-Error throws are wrapped in Error with cause
const [err, data] = tryCatch(() => {
  throw "string error";
});
// err.message === "string error", err.cause === "string error"
```

**Async functions** - Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(async () => {
  const res = await fetch("/api");
  return res.json();
});
```

**Direct promises** - Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(fetch("/api/data"));
const [err, data] = await tryCatch(Promise.resolve(42));
const [err, data] = await tryCatch(Promise.reject(new Error("fail")));
```

**Promise chains** - Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(() => fetch("/api").then((r) => r.json()));
```

#### Type Exports

`Result`, `Success`, and `Failure` types are now exported for use in your own type definitions:

```ts
import { tryCatch, Result, Success, Failure } from "@dschz/try-catch";
```

## 1.1.3

### Patch Changes

- Adds badges to readme

## 1.1.2

### Patch Changes

- updates package keywords for better discoverability

## 1.1.1

### Patch Changes

- updates readme with more examples

## 1.1.0

### Minor Changes

- updates signature to accept synchronous functions

## 1.0.3

### Patch Changes

- updates jsr config to only upload necessary files

## 1.0.2

### Patch Changes

- Fixes package exports

## 1.0.1

### Patch Changes

- Update README

## 1.0.0

### Major Changes

- Simple tryCatch utility function to allow async/await syntax
