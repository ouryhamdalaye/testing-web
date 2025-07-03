import '@testing-library/jest-dom'
const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream } = require('node:stream/web')
const { MessagePort } = require('node:worker_threads')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream
global.MessagePort = MessagePort

const { Request, Response, Headers } = require('undici')
global.Request = Request
global.Response = Response
global.Headers = Headers


// Mock crypto.randomUUID
global.crypto = {
  randomUUID: () => 'test-uuid',
}

// Mock NextResponse
jest.mock('next/server', () => {
  const NextResponse = {
    json: (body, init) => {
      const response = new Response(JSON.stringify(body), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      })
      Object.defineProperty(response, 'status', {
        get() {
          return init?.status || 200
        },
      })
      return response
    },
  }
  return { NextResponse }
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Mock window.confirm and window.alert
window.confirm = jest.fn(() => true)
window.alert = jest.fn()

// Mock environment variables
process.env.UPSTASH_REDIS_REST_URL = 'https://special-dassie-48886.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'Ab72AAIjcDEyMzVhMjVjOTdhZWU0ZGU0YmM3OWFjYjU4MjY1NjY0NXAxMA'

// Mock the Upstash Redis client
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    zrange: jest.fn(),
    zadd: jest.fn(),
    zrem: jest.fn(),
  })),
})) 