import type { Result, Something } from "./result";

export type Err = {
  message: string;
  cause?: unknown;
};

export function err(message: string, cause?: unknown): Err {
  return {
    message,
    cause,
  };
}

export function exceptionToErr(error: unknown): Err {
  if (Error.isError(error)) {
    return {
      message: error.message,
      cause: error.cause,
    };
  }

  // Unknown error type.
  return {
    message: "Unknown error",
    cause: { error },
  };
}

export function errToException(err: Err): Error {
  return new Error(err.message, { cause: err.cause });
}

export function wrap<T extends Something>(call: () => T): Result<T, Err> {
  try {
    const response = call();
    return {
      isOk: true,
      ok: response,
      err: undefined,
    };
  } catch (error: unknown) {
    return {
      isOk: false,
      ok: undefined,
      err: exceptionToErr(error),
    };
  }
}

export function unwrap<TOk extends Something>(
  result: Result<TOk, Err>,
): TOk | never {
  if (result.isOk) {
    return result.ok;
  }
  throw errToException(result.err);
}
