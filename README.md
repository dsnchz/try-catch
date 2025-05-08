# @dschz/try-catch

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

```ts
import { tryCatch } from "@dschz/try-catch";

const [err, data] = await tryCatch(fetch("/api/data"));

if (err) {
  console.error("Something went wrong:", err);
} else {
  console.log("Data:", data);
}
```

You can also pass a function that returns a promise:

```ts
const [err, user] = await tryCatch(() => fetchUserById(123));
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

MIT © [@dschz](https://github.com/thedanchez)
