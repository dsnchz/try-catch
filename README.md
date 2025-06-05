# @dschz/try-catch

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![npm](https://img.shields.io/npm/v/@dschz/try-catch?color=blue)](https://www.npmjs.com/package/@dschz/try-catch)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/try-catch)](https://bundlephobia.com/package/@dschz/try-catch)
[![JSR](https://jsr.io/badges/@dschz/try-catch/score)](https://jsr.io/@dschz/try-catch)
[![CI](https://github.com/dsnchz/try-catch/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/try-catch/actions/workflows/ci.yaml)

> A tiny utility to wrap promises or async functions and return a `[error, data]` tuple — no more `try/catch` boilerplate.

## ✨ Features

- ✅ Supports both async functions and raw promises
- ✅ Catches both **sync and async** errors
- ✅ Strongly typed result via `Result<T, E>`
- ✅ Zero dependencies — just TypeScript

## 📆 Installation

```bash
npm install @dschz/try-catch
pnpm install @dschz/try-catch
yarn install @dschz/try-catch
bun install @dschz/try-catch
```

## 🚀 Usage

### Wrapping a promise result

```ts
import { tryCatch } from "@dschz/try-catch";

const [err, res] = await tryCatch(fetch("/api/data"));
```

### Wrapping an async function

```ts
const [err, user] = await tryCatch(() => fetchUserById(123));
```

### Wrapping a sync function that might throw

```ts
const [err, parsed] = await tryCatch(() => JSON.parse('{"valid":true}'));

if (err) {
  console.error("Invalid JSON:", err.message);
}
```

## Note

⚠️ Always wrap expressions that might throw in a function.
This ensures the error is caught inside the try-catch scope.

```ts
// ✅ CORRECT
await tryCatch(() => JSON.parse("{ malformed }"));

// ❌ INCORRECT — throws before tryCatch is even called
await tryCatch(JSON.parse("{ malformed }"));
```

## 🧠 Types

```ts
type Success<T> = [error: null, data: T];
type Failure<E extends Error = Error> = [error: E, data: null];
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;
```

The return value is a tuple:

```ts
[error, data]; // One will always be null
```

## 🧪 Example with Custom Error Types

```ts
class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MyError";
  }
}

const [err, data] = await tryCatch<MyType, MyError>(() => doSomething());
```

## 📄 License

MIT © [Daniel Sanchez](https://github.com/thedanchez)
