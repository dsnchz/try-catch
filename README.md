# @dschz/try-catch

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![npm](https://img.shields.io/npm/v/@dschz/try-catch?color=blue)](https://www.npmjs.com/package/@dschz/try-catch)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/try-catch)](https://bundlephobia.com/package/@dschz/try-catch)
[![JSR](https://jsr.io/badges/@dschz/try-catch/score)](https://jsr.io/@dschz/try-catch)
[![CI](https://github.com/dsnchz/try-catch/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/try-catch/actions/workflows/ci.yaml)

> A tiny utility to wrap functions or promises and return a `[error, data]` tuple — no more `try/catch` boilerplate.

## Features

- Supports synchronous functions, async functions, and direct promises
- Returns the appropriate type based on input — no unnecessary `await` for sync functions
- Strongly typed with exported `Result<T, E>`, `Success<T>`, and `Failure<E>` types
- Non-Error throws are automatically wrapped in an `Error` with `cause`
- Zero dependencies

## Installation

```bash
npm install @dschz/try-catch
pnpm add @dschz/try-catch
yarn add @dschz/try-catch
bun add @dschz/try-catch
```

## Usage

### Synchronous functions

Returns `Result<T, E>` directly:

```ts
import { tryCatch } from "@dschz/try-catch";

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

### Async functions

Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(async () => {
  const res = await fetch("/api");
  return res.json();
});
```

### Direct promises

Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(fetch("/api/data"));
const [err, data] = await tryCatch(Promise.resolve(42));
const [err, data] = await tryCatch(Promise.reject(new Error("fail")));
```

### Promise chains

Returns `Promise<Result<T, E>>`:

```ts
const [err, data] = await tryCatch(() => fetch("/api").then((r) => r.json()));
```

## Important Note

Always wrap expressions that might throw in a function. This ensures the error is caught inside the try-catch scope:

```ts
// CORRECT
tryCatch(() => JSON.parse("{ malformed }"));

// INCORRECT — JSON.parse evaluates and throws before tryCatch is even called
tryCatch(JSON.parse("{ malformed }"));
```

## Types

All types are exported for use in your own type definitions:

```ts
import { tryCatch, Result, Success, Failure } from "@dschz/try-catch";

type Success<T> = [error: null, data: T];
type Failure<E extends Error = Error> = [error: E, data: null];
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;
```

The return value is a tuple where one value will always be `null`:

```ts
const [error, data] = tryCatch(() => someOperation());

if (error) {
  // handle error
  return;
}

// data is available here
```

## Custom Error Types

```ts
class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MyError";
  }
}

const [err, data] = await tryCatch<MyType, MyError>(async () => doSomething());
```

## License

MIT © [Daniel Sanchez](https://github.com/thedanchez)
