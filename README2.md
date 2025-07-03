# Understanding Jest Polyfills for Web APIs in Node.js Environment

## The Challenge

When testing Next.js applications with Jest, we often run into a fundamental mismatch: **Next.js expects browser APIs to be available, but Jest runs in Node.js**. This creates a gap we need to bridge.

### Why Do We Need These Polyfills?

A Polyfill is a small piece of code that adds functionality to your environment that it doesn't yet have natively.

Next.js is designed to run in both browser and Node.js environments. However, when we run tests with Jest:
1. We're in a pure Node.js environment
2. Many Web APIs that Next.js expects (`Request`, `Response`, etc.) are not available
3. Jest's default test environment (`jsdom`) doesn't include all modern Web APIs

## Our Polyfill Setup Explained

```javascript
// 1. Basic DOM APIs from testing-library
import '@testing-library/jest-dom'

// 2. Text Encoding APIs
const { TextEncoder, TextDecoder } = require('node:util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 3. Web Streams API
const { ReadableStream } = require('node:stream/web')
global.ReadableStream = ReadableStream

// 4. Web Workers API
const { MessagePort } = require('node:worker_threads')
global.MessagePort = MessagePort

// 5. Fetch API and related interfaces
const { Request, Response, Headers } = require('undici')
global.Request = Request
global.Response = Response
global.Headers = Headers
```

### Breaking Down Each Part:

1. **Text Encoding (TextEncoder/TextDecoder)**
   - Used for converting between strings and typed arrays
   - Required by modern web APIs for handling binary data
   - Essential for processing request/response bodies

2. **Web Streams (ReadableStream)**
   - Modern way to handle streaming data
   - Used by Fetch API for request/response bodies
   - Enables efficient processing of large data

3. **Web Workers API (MessagePort)**
   - Part of the Web Workers specification
   - Required for certain Next.js features
   - Enables communication between different parts of the application

4. **Fetch API (Request, Response, Headers)**
   - We use `undici` instead of `node-fetch` because:
     - It's what Next.js uses internally
     - Better compatibility with Next.js's expectations
     - More complete implementation of web standards

## Why This Order Matters

The order of these polyfills is important:
1. First, we add basic text processing capabilities (TextEncoder/TextDecoder)
2. Then we add streaming capabilities (ReadableStream)
3. Finally, we add the Fetch API components that depend on these foundations

## Common Gotchas

1. **Missing Polyfills**
   - Error: "ReferenceError: TextEncoder is not defined"
   - Solution: Add the missing polyfill from `node:util`

2. **Wrong Implementation**
   - Error: "Type 'Request' is not assignable to type 'Request'"
   - Solution: Use `undici` instead of `node-fetch` for better Next.js compatibility

3. **Order Dependencies**
   - Some polyfills depend on others being available first
   - Always add basic utilities before complex APIs

## Best Practices

1. **Keep Track of Node.js Versions**
   - Different Node versions have different built-in Web APIs
   - Document minimum Node.js version requirements

2. **Update with Next.js**
   - New Next.js versions might require additional polyfills
   - Check release notes when upgrading

3. **Test Environment Consistency**
   - Use the same polyfills across all test files
   - Set up in a central `jest.setup.js`

## Further Reading

- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Jest Configuration Guide](https://jestjs.io/docs/configuration)
- [Web Standards](https://developer.mozilla.org/en-US/docs/Web/API)
- [Undici Documentation](https://undici.nodejs.org/#/) 