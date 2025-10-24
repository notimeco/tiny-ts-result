# tiny-ts-result

A minimal result type for typescript. `tiny-ts-result` makes it easy to switch _exception based_ error
handling to using _errors as values_.

## Exception based error handling

Many functions fail and throw exceptions, correct exception handling in typescript can be tedious and error-prone. A
javascript function can throw anything, most often they throw Errors. The best way to check for errors is to use
javascript's nominal type checking `instanceof` but this always still leaves the awkward `unknown` case that needs
to be handled in every try catch.

Example: Trying to call `getUserOrThrow` and handling any error.

```typescript
/**
 * Load a User from a function that might throw.
 *
 * Handle the error case with an early return.
 * Handle the user case if nothing was thrown.
 */
function exampleWithoutUsingResult(userId: string): void {
  let user: User;
  try {
    user = getUserOrThrow(userId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      handleError(error);
      return;
    }

    // Handle the error again in case it wasn't an Error.
    handleError(new Error("Unknown error", { cause: error }));
    return;
  }

  handleUser(user);
}
```

## Errors as values

A result type is an alternative to throwing exceptions. Instead of throwing a function returns a result, a union
type representing either success with the original return type or failure with a simple error type.

`tiny-ts-result` implements a minimal result type that enables clean error handling without needing buy into an
entirely different programming paradigm. It tries to solve a few simple problems and then get out of the way.

Destructure a result, check and handle the error, then safely handled the expected return in the original scope.

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

  handleUser(user);
}
```

## Batch processing

Batch processing can make things more difficult again. Often a batch needs to complete as much work as possible
and model partial success. Throwing during batch processing unwinds the stack and typically prevents the remainder
of the batch from being processed.

Result types avoid the stack unwinding caused by exceptions and manage the results.

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

## Exceptions interoperating with errors as values

_Switching from exceptions to errors as values_

Most projects will still need to interact with exceptions at some point. A project may support either paradigm or
more likely will be using 3rd party libraries that rely heavily on exceptions for error handling.

Use `wrap` to convert any exception throwing function into a result returning one. `wrap` will run a given task in a
try catch block, catch any error and return a result type that is either the expected result or the error.

Example: Wrapping a function that might throw.

```typescript
const result: Result<User, Error> = wrap(() => getUserOrThrow(userId));
```

_Switching from errors as values back to exceptions_

Many applications rely on a top level error handler to translate exceptions back into valid responses, or in other
cases it may just be easiest to get the required information by throwing and checking the output.

Use `unwrap` on any result to either get the success type or throw.

```typescript
const result: Result<User, Error> = wrap(() => getUserOrThrow(userId));

const user: User = unwrap(result);
```

## Working examples

Read `src/examples` for a variety of use cases and some extra details in the comments.

- [basic-narrowing-batch](./src/examples/basic-narrowing-batch.ts)
- [basic-narrowing-edge-case](./src/examples/basic-narrowing-edge-case.ts)
- [basic-narrowing](./src/examples/basic-narrowing.ts)
- [generic-narrowing-limitations](./src/examples/generic-narrowing-limitations.ts)
- [generic-narrowing](./src/examples/generic-narrowing.ts)
- [unwrapping-custom-exceptions](./src/examples/unwrapping-custom-exceptions.ts)
- [unwrapping-exceptions](./src/examples/unwrapping-exceptions.ts)
- [wrapping-calls-catching-all-exceptions](./src/examples/wrapping-calls-catching-all-exceptions.ts)
- [wrapping-calls-catching-instances-of](./src/examples/wrapping-calls-catching-instances-of.ts)

## Async

Everything here is synchronous for now. `Promise.allSettled` seems to already be just fine. Some async functionality
might get added in a later version.
