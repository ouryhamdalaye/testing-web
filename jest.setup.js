import '@testing-library/jest-dom'

// Mock Response and Request
class MockResponse {
  constructor(body, init) {
    this.body = body
    this.init = init || {}
    this.status = init?.status || 200
    this.headers = new Headers(init?.headers)
  }

  async json() {
    return JSON.parse(this.body)
  }
}

global.Response = MockResponse
global.Headers = class Headers {
  constructor(init) {
    this.headers = {}
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.headers[key.toLowerCase()] = value
      })
    }
  }

  get(name) {
    return this.headers[name.toLowerCase()]
  }

  set(name, value) {
    this.headers[name.toLowerCase()] = value
  }
}

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
process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis-url'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

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