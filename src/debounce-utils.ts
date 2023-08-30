export type Timeout = ReturnType<typeof setTimeout>;

export const debounceWithLimit = <A, B>(
  debounceMs: number,
  maxMs: number,
  fn: (a: A, b: B) => void
): ((a: A, b: B) => void) => {
  let timeout: Timeout | undefined;
  let firstInvoke: number | undefined;
  return (a: A, b: B) => {
    const now = Date.now();
    const reachedLimit = firstInvoke && now - firstInvoke > maxMs;
    if (reachedLimit) {
      clearTimeout(timeout);
      timeout = undefined;
      firstInvoke = undefined;
      fn(a, b);
      return;
    }

    if (!firstInvoke) {
      firstInvoke = now;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      firstInvoke = undefined;
      fn(a, b);
    }, Math.min(debounceMs, firstInvoke + maxMs - now));
  };
};

export const idempotentDebounce = (
  debounceMs: number,
  f: () => void
): (() => void) => {
  let timeout: Timeout | null = null;
  return () => {
    if (timeout) {
      // already scheduled
      return;
    }

    timeout = setTimeout(() => {
      timeout = null;
      f();
    }, debounceMs);
  };
};

export const invokeAtMostOnceEvery = (
  timePeriodMs: number,
  f: () => void
): (() => void) => {
  let lastInvoked = 0;
  return () => {
    const now = Date.now();
    if (now - lastInvoked > timePeriodMs) {
      lastInvoked = now;
      f();
    }
  };
};
