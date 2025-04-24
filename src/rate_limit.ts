import {DateTime} from "luxon";
import {ioc} from "@nicolawealth/ioc";

const nowMs = (): number => DateTime.now().toUTC().toMillis();
type setTimeoutType = <R>(f: () => void, ms: number) => R;
const setTimeout: setTimeoutType = (f, ms) => setTimeout(f, ms);

const deps = {nowMs, setTimeout};

export const rateLimitFactory =
  (delayBetweenCallsMs: number, f: () => void) => {
    let last = deps.nowMs() - delayBetweenCallsMs;
    let timeoutHandle: unknown;

    return () => {
      if (timeoutHandle) {
        return; // f() already scheduled to run in the future.
      }
      const now = deps.nowMs();
      const since = now - last;
      if (since < delayBetweenCallsMs) { // too soon, schedule to run in the future
        timeoutHandle = deps.setTimeout(() => {
          f();
          last = deps.nowMs(); // update to time when called.
          timeoutHandle = undefined;
        }, delayBetweenCallsMs - since);
      } else { // long enough since last call, call f() directly.
        last = now;
        f();
      }
    };
  };

// rateLimitEmitLast wraps an async function f and "rate limits" calls to it
// ensures f is called at most once every delayBetweenCallsMs
// ensures the last call made to rateLimitedF in the last delayBetweenCallsMs is the one forwarded to callF
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const rateLimitEmitLastFactory = <TP, TR>(delayBetweenCallsMs: number, f: (params: TP) => Promise<TR>, callback: (last: TR) => void) => {
  let last = deps.nowMs() - delayBetweenCallsMs;
  let timeoutHandle: unknown;
  let lastParams: TP;
  let lastParamsVersion = 0;

  // create the wrapped form of f to return later
  return async (params: TP) => {
    lastParams = params; // track last params asked for
    ++lastParamsVersion; // and a version

    if (timeoutHandle) {
      return; // f already scheduled to run in the future.
    }
    const now = deps.nowMs();
    const since = now - last;

    // since this is a recursive timeout call we name it
    const callF = async () => {
      const paramsVersionIssued = lastParamsVersion;
      callback(await f(lastParams));
      last = deps.nowMs(); // update to time when last call completed.

      if (paramsVersionIssued !== lastParamsVersion) {
        // edge case, lastParams was updated while we waited on f to complete
        // so schedule another call to f for later using those params (or newer ones)
        timeoutHandle = deps.setTimeout(callF, delayBetweenCallsMs);
      } else {
        timeoutHandle = undefined;
      }
    };

    if (since < delayBetweenCallsMs) {
      // too soon, schedule to run in the future
      timeoutHandle = deps.setTimeout(callF, delayBetweenCallsMs - since);
    } else {
      // callF NOW!
      await callF();
    }
  };
};

rateLimitFactory.deps = ioc.dep(deps);
rateLimitEmitLastFactory.deps = ioc.dep(deps);
