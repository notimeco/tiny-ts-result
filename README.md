# tiny-ts-result

A minimal result type for typescript. `tiny-ts-result` makes it easy to switch from using _exception based_ error
handling to using _errors as values_.

[![Build and test](https://github.com/notimeco/tiny-ts-result/actions/workflows/main.yml/badge.svg)](https://github.com/notimeco/tiny-ts-result/actions/workflows/main.yml)

## Getting started

Install the package.

```shell
npm install @notimeco/tiny-ts-result
```

Start creating `Result` types.

```typescript
import type { Result } from "@notimeco/tiny-ts-result";
import { makeResultErr, makeResultOk } from "@notimeco/tiny-ts-result";

// A result function returns either an _ok_ or an _err_.
function getUsernameResult(userId: string): Result<string> {
  if (ifSomethingFails()) {
    return makeResultErr("Something failed");
  }
  return makeResultOk("My username");
}
```

## Very nice, what's it for?

Typescript's structural based type checking makes dealing with complex types a breeze, but the fun typically stops
when it's time to do error handling. Every caught error is typed `unknown`, making it difficult to handle safely and
correctly. The `Result` type enables an _errors as values_ style approach that is both clearer to read and safer to run.

### Problems with exception based error handling

Many functions fail and throw exceptions, correct exception handling in typescript can be tedious and error-prone. A
javascript function can throw anything, this makes type safe error handling difficult as typescript sets caught
values as `unknown`. A common approach to check for errors is to use javascript's nominal type checking `instanceof`
but this always still leaves the awkward `unknown` case that needs to be handled in every try catch.

Example: Trying to call `getUserOrThrow` and handling any error.

```typescript
/**
 * Load a User from a function that might throw.
 *
 * Handle the error case with an early return.
 * Handle the user case if nothing was thrown.
 */
function exampleWithoutUsingResult(userId: string): void {
  let user: User; // <- Either use `let` or put everything in the `try` scope.
  try {
    user = getUserOrThrow(userId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleError(error);
      return;
    }

    // Handle the error again in case it wasn't an Error.
    handleError(new Error("Unknown error", { cause: error })); // <- What is this?
    return;
  }

  handleUser(user);
}
```

### Solutions with errors as values

A result type is an alternative to throwing exceptions where errors are simply values. Instead of throwing a function
returns a result, a union type representing either success with the original return type or failure with an error
value. `tiny-ts-result` uses a discriminated union to model a result to take advantage of typescript's strong type
narrowing capabilities.

Example: A simpler (non-generic) example of a result union with a discriminator `isOk`.

```typescript
type UserResult =
  | {
      isOk: true;
      ok: User;
      err: undefined;
    }
  | {
      isOk: false;
      ok: undefined;
      err: Error;
    };
```

`tiny-ts-result` implements a minimal result type that enables clean error handling without needing buy into an
entirely different programming paradigm. It tries to solve a few simple problems and then get out of the way.

Consider a function that returns a result type. Destructure the result into `ok` and `err`, handle the error in with
an early return, and typescript will narrow the type of the `ok` variable for the remainder of the scope. This keeps
the happy case left aligned in the original scope.

Example: Calling `getUserResult` and handling any error.

```typescript
/**
 * Load a Result<User, Error>.
 * Handle the error case with an early return.
 * Handle the happy case with a type safe User.
 */
function example(userId: UUID): void {
  const { ok: user, err } = getUserResult(userId);
  if (err) {
    handleError(err);
    return;
  }

  handleUser(user); // <- original scope, not indented
}
```

### Batch processing

Batch processing can make things more difficult again. Often a batch needs to complete as much work as possible
and model partial success. Throwing during batch processing unwinds the stack and typically prevents the remainder
of the batch from being processed.

Result types avoid the stack unwinding caused by exceptions, allow all the work to complete, and then make it easy
to manage.

Example: Easily handling a batch of calls that could fail.

```typescript
/**
 * Load a batch of Result<User, Error>.
 * Handle all the errors.
 * Handle all the users.
 */
function example(userIds: UUID[]): void {
  const [users, errs] = groupResults(userIds.map(getUserResult));

  errs.map(handleError);
  users.map(handleUser);
}
```

### Exceptions interoperating with errors as values

**Switching from exceptions to errors as values**

Most projects will still need to interact with exceptions at some point. A project may be supporting a mix of
exceptions, and errors as values. There may also be 3rd party libraries that rely heavily on exceptions for error
handling. Dealing with exceptions will still need to happen. Risky functions can be wrapped by try catch and result
mapping logic to convert an exception throwing one to a result returning one.

Use `wrap` to convert any exception throwing function into a result returning one. `wrap` will run a given task in a
try catch block, catch any error and return a result type that is either the expected success type or an error.

Example: Wrapping a function that might throw.

```typescript
const result: Result<User, Error> = wrap(() => getUserOrThrow(userId));
```

**Switching from errors as values back to exceptions**

Many applications rely on a top level error handler to translate exceptions back into valid responses. There are
also many instances where an exception is actually the best way to solve a problem, catching exceptions with the
debugger, or just skipping manual error handling to get a result quicker. Errors as values doesn't have to mean never
throw. Result types can be unwrapped to return either the success value or just throw an error.

Use `unwrap` on any result to either get the success type or throw.

```typescript
const result: Result<User, Error> = wrap(() => getUserOrThrow(userId));

const user: User = unwrap(result);
```

## Examples

Read `src/examples` for a showcase of all available functionality with some commentary.

- [basic-narrowing](./src/examples/basic-narrowing.ts)
- [basic-narrowing-edge-case](./src/examples/basic-narrowing-edge-case.ts)
- [basic-narrowing-batch](./src/examples/basic-narrowing-batch.ts)
- [unwrapping-exceptions](./src/examples/unwrapping-exceptions.ts)
- [unwrapping-custom-exceptions](./src/examples/unwrapping-custom-exceptions.ts)
- [wrapping-calls-catching-all-exceptions](./src/examples/wrapping-calls-catching-all-exceptions.ts)
- [wrapping-calls-catching-instances-of](./src/examples/wrapping-calls-catching-instances-of.ts)
- [generic-narrowing](./src/examples/generic-narrowing.ts)
- [generic-narrowing-limitations](./src/examples/generic-narrowing-limitations.ts)

## What about async?

Everything here is synchronous for now. `Promise.allSettled` seems to already be just fine. Some async functionality
might get added in a later version.
