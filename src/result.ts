import { Err } from "./error";

// `Something` is used as a generic type constraint, meaning the
// generic type can be anything other than null or undefined.
// This includes strings, boolean, etc and is deliberate.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Something = {};

export type ResultOk<TOk extends Something> = {
  isOk: true;
  ok: TOk;
  err: undefined;
};

export type ResultErr<TErr extends Something = Err> = {
  isOk: false;
  ok: undefined;
  err: TErr;
};

export type Result<TOk extends Something, TErr extends Something = Err> =
  | ResultOk<TOk>
  | ResultErr<TErr>;

export function resultOk<TOk extends Something>(ok: TOk): ResultOk<TOk> {
  return {
    isOk: true,
    ok,
    err: undefined,
  };
}

export function resultErr<TErr extends Something = Err>(
  err: TErr,
): ResultErr<TErr> {
  return {
    isOk: false,
    ok: undefined,
    err,
  };
}

export function isResultOk<TOk extends Something>(
  result: Result<TOk, Something>,
): result is ResultOk<TOk> {
  return result.isOk;
}

export function isResultErr<TErr extends Something = Err>(
  result: Result<Something, TErr>,
): result is ResultErr<TErr> {
  return !result.isOk;
}

export function groupResults<
  TOk extends Something,
  TErr extends Something = Err,
>(results: Result<TOk, TErr>[]): [TOk[], TErr[]] {
  const oks: TOk[] = [];
  const errs: TErr[] = [];
  for (const result of results) {
    if (result.isOk) {
      oks.push(result.ok);
    } else {
      errs.push(result.err);
    }
  }
  return [oks, errs];
}
