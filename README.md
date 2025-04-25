![Tests Passing](https://github.com/NicolaWealth/rate_limit/actions/workflows/auto_test_main_badge.yml/badge.svg)
![Code Cov](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fnicolawealth%2Frate_limit%2Fraw%2Fmain%2Fcodecov/badge.json&query=%24.message&label=Code%20Coverage&color=%24.color)

# Introduction
The `rate_limit` package provides utility for rate limiting function calls to control the frequency of function execution and manage the timing of calls efficiently.

# Installation
This package should be installed via npm. You must have npm installed first. The following can be run on the commandline to install the `rate_limit` package with npm:

`npm install @nicolawealth/rate_limit`

# Usage
The functionality provided by the `rate_limit` package is useful in limiting function call frequency in a variety of scenarios, including but not limited to:
* API calls
* Event handling
* Message logging
* Async data fetching
* UI updates
* etc.

# Interface
The package exports two functions: `rateLimitFactory(delayBetweenCallsMs, function())` and `rateLimitEmitLastFactory(delayBetweenCallsMs, asyncFunction(params), callback(last))`:

## RateLimitFactory
`rateLimitFactory(delayBetweenCallsMs, function)` returns a parameterless function (referred to as `rateLimitedFunction()`) which ensures `function()` is called at most once every `delayBetweenCallsMs` milliseconds. Here `function()` must be a parameterless, void function.
* If we call `rateLimitedFunction()` once, `function()` is called right away. 
* If we make a second call before `delayBetweenCallsMs` milliseconds have passed, the call will be scheduled for later (deferred). 
* If a third call is made to `rateLimitedFunction()` before `delayBetweenCallsMs` milliseconds have passed from the original call, the call will be ignored. I.e. only one call is scheduled at a time with priority given to the oldest. 

## RateLimitEmitLastFactory
`rateLimitEmitLastFactory(delayBetweenCallsMs, asyncFunction(params), callback(last))` returns a function (referred to as `rateLimitedEmitLastFunction(params)`) which ensures `asyncFunction(params)` is called at most once every `delayBetweenCallsMs` milliseconds. Here `asyncFunction(params)` is an asynchronous function with parameters denoted by `params`.
* If we call `rateLimitedEmitLastFunction(paramsOne)` once, `asyncFunction(paramsOne)` is called right away.
* If we make a second call, `rateLimitedEmitLastFunction(paramsTwo)` before `delayBetweenCallsMs` milliseconds have passed, the call `asyncFunction(paramsTwo)` will be scheduled for later (deferred).
* If a third call is made to `rateLimitedEmitLastFunction(paramsThree)` before `delayBetweenCallsMs` milliseconds have passed from the original call, the deferred call will be replaced and `asyncFunction(paramsThree)` will be scheduled for later. I.e. only one call is scheduled at a time with priority given to the latest arguments: `params`.
Here, `callback(last)` is the provided callback function which consumes and processes the results of the calls to `asyncFunction(params)` where . A simple callback function could be set-up as follows:
```
const callback = (data: string) => {
  console.log(data);
};
```

# Testing
Tests can be found in `rate_limit.test.ts` located in `rate_limit/src` and should be run with sinon, mocha and nyc.

