![Tests Passing](https://github.com/NicolaWealth/rate_limit/actions/workflows/auto_test_main_badge.yml/badge.svg)
![Code Cov](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fnicolawealth%2Frate_limit%2Fraw%2Fmain%2Fcodecov/badge.json&query=%24.message&label=Code%20Coverage&color=%24.color)

# Introduction
A lightweight utility for rate-limiting function calls in JavaScript/TypeScript. It helps control execution frequency and manage timing for synchronous and asynchronous operations.

# Installation
Requires Node.js ≥ 18.

Install via npm:
`npm install @nicolawealth/rate_limit`

## Peer Dependency
This package relies on @nicolawealth/ioc as a peer dependency. It will not be bundled with rate_limit, so you need to install it in your project:
`npm install @nicolawealth/ioc`

# Compatibility Notes
The rate_limit package ships with two build formats:

### ESM (Modern)
#### (dist/index.modern.js)

Recommended for modern bundlers like Webpack, Vite, or Rollup.
Install both packages via npm & import:
```ts
import { rateLimitFactory } from '@nicolawealth/rate_limit';
import { ioc } from '@nicolawealth/ioc';
```
### UMD 
#### (dist/index.umd.js)
Suitable for script-tag usage in browsers or environments without module loaders.
If you use the UMD build, you must ensure the peer dependency `@nicolawealth/ioc` is loaded first and exposed globally as `window.ioc`.

Example:
```html 
<script src="path/to/ioc.umd.js"></script>
<script src="path/to/rate_limit.umd.js"></script>
```
The UMD bundle will reference ioc as a global variable.

# Why Use rate_limit?
Rate limiting is essential for:
- Preventing API overload
- Throttling expensive operations
- Managing UI updates efficiently
- Handling rapid event streams
- Reducing redundant async calls

# Interface
The package exports two functions: 
- `rateLimitFactory(delayBetweenCallsMs, function())` and 
- `rateLimitEmitLastFactory(delayBetweenCallsMs, asyncFunction(params), callback(last))`:

# Exports
## RateLimitFactory
Creates a wrapper that ensures fn() runs at most once every delayBetweenCallsMs milliseconds.
### Behavior:

- The first call executes immediately.
- Subsequent calls within the delay window:
  - One deferred call is scheduled.
  - Additional calls are ignored until the scheduled call runs.
### Example
```ts
import { rateLimitFactory } from '@nicolawealth/rate_limit';

const log = () => console.log('Action!');
const rateLimitedLog = rateLimitFactory(1000, log);

rateLimitedLog(); // Executes immediately
rateLimitedLog(); // Deferred
rateLimitedLog(); // Ignored
```

## RateLimitEmitLastFactory
Wraps an async function so it runs at most once per delay window, but always processes the latest parameters.
### Behavior:

- The first call executes immediately.
- Subsequent calls within the delay window:
    - Only the most recent parameters are retained.
    - Deferred execution uses the latest arguments.
- callback(result) is invoked after each execution.
### Example
```ts
import { rateLimitEmitLastFactory } from '@nicolawealth/rate_limit';

const fetchData = async (query: string) => {
  // Simulate API call
  return `Result for ${query}`;
};

const handleResult = (data: string) => console.log(data);

const rateLimitedFetch = rateLimitEmitLastFactory(2000, fetchData, handleResult);

rateLimitedFetch('first');  // Executes immediately
rateLimitedFetch('second'); // Deferred, replaces previous
rateLimitedFetch('third');  // Deferred, replaces previous
```

# Testing
Tests are located in `src/rate_limit.test.ts` and use:
- Mocha for test runner
- Sinon for mocking timers
- NYC for coverage

Run tests:
```shell
npm run test
```
or for robust output:
```shell
npm run test-r
```
Run coverage:
```shell
npm run coverage
```

# Development notes
- `npm run clean`: Removes dist/ folder & caches
- `npm run build`: Builds both formats
- `npm run lint`: Runs ESLint
- `npm run docs`: Generates documentation
