/**
 * @fileoverview API Route tests for tickets collection endpoints
 * @package api/tickets
 * 
 * @test-type Integration
 * @test-coverage GET /api/tickets, POST /api/tickets
 * @test-framework Jest + Next.js API Testing
 * 
 * @description
 * Tests the main tickets collection endpoints:
 * - GET: Retrieves list of all tickets
 * - POST: Creates a new ticket
 * Tests cover successful operations and error handling.
 * 
 * @testing-strategy
 * Direct testing of Next.js API routes using Request/Response objects.
 * Mocks Redis operations for controlled testing.
 * Validates response status codes, headers, and body content.
 * Tests both success and error scenarios.
 * 
 * @mocks
 * - Redis operations (getTickets, createTicket)
 * - Next.js Response objects
 * 
 * @dependencies
 * - next/server: NextResponse
 * - @/lib/redis: Redis operations
 * 
 * @author Your Name
 * @last-modified 2024-03-XX
 */

import { NextResponse } from 'next/server'
import { GET, POST } from './route'
import { createTicket, getTickets } from '@/lib/redis'

// Mock Redis functions
jest.mock('@/lib/redis', () => ({
  createTicket: jest.fn(),
  getTickets: jest.fn(),
}))

describe('Tickets API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns tickets successfully', async () => {
      const mockTickets = [
        {
          id: '1',
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          responses: [],
        },
      ]

      ;(getTickets as jest.Mock).mockResolvedValue(mockTickets)

      const response = await GET()
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(data).toEqual(mockTickets)
      expect(getTickets).toHaveBeenCalled()
    })

    it('handles errors', async () => {
      ;(getTickets as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal Server Error' })
    })
  })

  describe('POST', () => {
    it('creates a ticket successfully', async () => {
      const mockTicket = {
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open',
      }

      const mockCreatedTicket = {
        ...mockTicket,
        id: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      ;(createTicket as jest.Mock).mockResolvedValue(mockCreatedTicket)

      const request = new Request('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTicket),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedTicket)
      expect(createTicket).toHaveBeenCalledWith(mockTicket)
    })

    it('validates request body', async () => {
      const request = new Request('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }), // Invalid data
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
      expect(createTicket).not.toHaveBeenCalled()
    })

    it('handles errors', async () => {
      const mockTicket = {
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open',
      }

      ;(createTicket as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTicket),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal Server Error' })
    })
  })
}) 