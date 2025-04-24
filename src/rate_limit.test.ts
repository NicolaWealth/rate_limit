import assert from 'assert';
import {rateLimitFactory, rateLimitEmitLastFactory} from './rate_limit';
import {resolvedPromise} from '@nicolawealth/resolved_promise';
import {ioc} from "@nicolawealth/ioc";

function getTimeoutStub() {
  const nowMs = () => nowMs.returnValue;
  nowMs.returnValue = 1000;

  const setTimeout: any = (callback: () => undefined, delay?: number) => {
    setTimeout.callback = callback;
    setTimeout.delay = delay;
    setTimeout.callCount++;
    return setTimeout.handle++;
  };
  setTimeout.callback = () => undefined;
  setTimeout.delay = undefined;
  setTimeout.callCount = 0;
  setTimeout.handle = 1;
  const deps = {nowMs, setTimeout};
  rateLimitFactory.deps.set(deps);
  rateLimitEmitLastFactory.deps.set(deps);
  return {nowMs, setTimeout};
}

describe('rateLimitFactory', () => {
  after(() => ioc.reset());
  const setup = () => {
    const {nowMs, setTimeout} = getTimeoutStub();

    // The rate limiter gives us a rate-limited wrapper around the function we pass it.
    const fStub = () => {
      fStub.callCount += 1;
    };
    fStub.callCount = 0;
    let rateLimitedF = rateLimitFactory(100, fStub);

    return {nowMs, setTimeout, fStub, rateLimitedF};
  };

  it('Happy path', async () => {
    const {nowMs, setTimeout, fStub, rateLimitedF} = setup();

    // If we call the rate-limited wrapper once, the original function is called right away
    rateLimitedF();
    assert.strictEqual(setTimeout.callCount, 0);
    assert.strictEqual(fStub.callCount, 1);

    // If we make a second call before the rate is up, the call will be scheduled for later
    nowMs.returnValue = 1010;
    rateLimitedF();
    assert.strictEqual(setTimeout.callCount, 1);
    assert.strictEqual(setTimeout.delay, 90);
    assert.strictEqual(fStub.callCount, 1);

    // If we call the rate-limited wrapper a third time before the rate is up, the call will be dropped
    // (oldest of the rate-limited calls wins)
    nowMs.returnValue = 1020;
    rateLimitedF();
    assert.strictEqual(setTimeout.callCount, 1);
    assert.strictEqual(fStub.callCount, 1);

    // 100 ms from the first deferred call, the timed-out callback runs
    nowMs.returnValue = 1110;
    setTimeout.callback();
    assert.strictEqual(fStub.callCount, 2);

    // After a bit more time has elapsed we should again be able to get a call through,
    // this is essentially identical to the first call we made
    nowMs.returnValue = 2000;
    rateLimitedF();
    assert.strictEqual(fStub.callCount, 3);
    assert.strictEqual(setTimeout.callCount, 1);
  });
});

describe('rateLimitEmitLastFactory', () => {
  after(() => ioc.reset());
  const setup = () => {
    const {nowMs, setTimeout} = getTimeoutStub();

    // The rate limiter gives us a rate-limited wrapper around the the function we pass it.
    const delayBetweenCallsMsMock = 100;
    const fStub: any = (arg: any) => {
      fStub.lastCalledWith = arg;
      fStub.callCount += 1;
      return resolvedPromise.undefined;
    };
    fStub.lastCalledWith = undefined;
    fStub.callCount = 0;
    const callbackStub: () => void = () => {
    };
    let rateLimitedF = rateLimitEmitLastFactory(delayBetweenCallsMsMock, fStub, callbackStub);

    return {nowMs, setTimeout, fStub, rateLimitedF};
  };

  it('Happy path', async () => {
    const {nowMs, setTimeout, fStub, rateLimitedF} = setup();

    // If we call the rate-limited wrapper once, the original function is called right away
    await rateLimitedF('first call');
    assert.strictEqual(setTimeout.callCount, 0);
    assert.strictEqual(fStub.callCount, 1);
    assert.strictEqual(fStub.lastCalledWith, 'first call');

    // If we call the rate-limited wrapper again before the rate is up, the call is deferred
    nowMs.returnValue = 1010;
    await rateLimitedF('second call');
    assert.strictEqual(setTimeout.callCount, 1);
    assert.strictEqual(setTimeout.delay, 90);
    assert.strictEqual(fStub.callCount, 1);

    // If we call the rate-limited wrapper a third time before the rate is up, the deferred call should be set to use this argument instead
    nowMs.returnValue = 1020;
    await rateLimitedF('third call');
    assert.strictEqual(setTimeout.callCount, 1);
    assert.strictEqual(fStub.callCount, 1);

    // 100ms from the first deferred call, the timed-out callback runs with the latest arguments
    nowMs.returnValue = 1110;
    await setTimeout.callback();
    assert.strictEqual(fStub.callCount, 2);
    assert.strictEqual(fStub.lastCalledWith, 'third call');

    // After a bit more time has elapsed we should again be able to get a call through,
    // this is essentially identical to the first call we made
    nowMs.returnValue = 2000;
    await rateLimitedF('fourth call');
    assert.strictEqual(fStub.callCount, 3);
    assert.strictEqual(setTimeout.callCount, 1);
  });

  it('Edge case - lastParams was updated while we waited on f to complete', async () => {
    const {nowMs, setTimeout, rateLimitedF} = setup();

    await rateLimitedF('first call');

    nowMs.returnValue = 1010;
    await rateLimitedF('second call'); // will be deferred, just like the above test
    assert.strictEqual(setTimeout.callCount, 1); // that's normal
    assert.strictEqual(setTimeout.delay, 90);

    nowMs.returnValue = 2000; // well past the rate limit
    setTimeout.callback(); // simulating a long-running callback to set up the problemastic race condition
    await rateLimitedF('third call'); // call while waiting for the previous call's callback

    // since we've past the rate limit, we would normally expect 'third call' to go straight through,
    // but in this case setTimeout has been called again because of the long-running callback
    assert.strictEqual(setTimeout.callCount, 2);
  });
});
