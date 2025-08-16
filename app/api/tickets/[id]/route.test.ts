/**
 * @fileoverview API Route tests for individual ticket operations
 * @package api/tickets/[id]
 * 
 * @test-type Integration
 * @test-coverage GET, PUT, DELETE /api/tickets/[id]
 * @test-framework Jest + Next.js API Testing
 * 
 * @description
 * Tests endpoints for individual ticket operations:
 * - GET: Retrieves a specific ticket
 * - PUT: Updates a ticket's details
 * - DELETE: Removes a ticket
 * Includes validation of route parameters and error cases.
 * 
 * @testing-strategy
 * Tests dynamic route handling with URL parameters.
 * Mocks Redis operations for predictable testing.
 * Validates proper error handling for non-existent tickets.
 * Ensures proper status codes and response formats.
 * 
 * @mocks
 * - Redis operations (getTicket, updateTicket, deleteTicket)
 * - Next.js Response and Request objects
 * 
 * @dependencies
 * - next/server: NextResponse
 * - @/lib/redis: Redis operations
 * 
 * @author Your Name
 * @last-modified 2024-03-XX
 */

import { NextResponse } from 'next/server'
import { GET, DELETE, PATCH } from './route'
import { getTicket, deleteTicket, updateTicketStatus, addResponse } from '@/lib/redis'

// Mock Redis functions
jest.mock('@/lib/redis', () => ({
  getTicket: jest.fn(),
  deleteTicket: jest.fn(),
  updateTicketStatus: jest.fn(),
  addResponse: jest.fn(),
}))

describe('Individual Ticket API Routes', () => {
  const mockParams = { params: { id: '1' } }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns a ticket successfully', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      ;(getTicket as jest.Mock).mockResolvedValue(mockTicket)

      const request = new Request('http://localhost:3000/api/tickets/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(data).toEqual(mockTicket)
      expect(getTicket).toHaveBeenCalledWith('1')
    })

    it('returns 404 when ticket not found', async () => {
      ;(getTicket as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/tickets/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Ticket not found' })
    })

    it('handles errors', async () => {
      ;(getTicket as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/tickets/1')
      const response = await GET(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal Server Error' })
    })
  })

  describe('DELETE', () => {
    it('deletes a ticket successfully', async () => {
      ;(deleteTicket as jest.Mock).mockResolvedValue(undefined)

      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, mockParams)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(204)
      expect(deleteTicket).toHaveBeenCalledWith('1')
    })

    it('handles errors', async () => {
      ;(deleteTicket as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal Server Error' })
    })
  })

  describe('PATCH', () => {
    it('updates ticket status successfully', async () => {
      const mockUpdatedTicket = {
        id: '1',
        title: 'Test Ticket',
        status: 'closed',
        description: 'Test Description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      ;(updateTicketStatus as jest.Mock).mockResolvedValue(mockUpdatedTicket)

      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(data).toEqual(mockUpdatedTicket)
      expect(updateTicketStatus).toHaveBeenCalledWith('1', 'closed')
    })

    it('adds response successfully', async () => {
      const mockResponse = {
        id: '1',
        content: 'Test Response',
        createdAt: new Date().toISOString(),
      }

      ;(addResponse as jest.Mock).mockResolvedValue(mockResponse)

      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test Response' }),
      })
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(data).toEqual(mockResponse)
      expect(addResponse).toHaveBeenCalledWith('1', 'Test Response')
    })

    it('validates request body', async () => {
      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      })
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid request body' })
    })

    it('handles validation errors', async () => {
      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid-status' }),
      })
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('handles errors', async () => {
      ;(updateTicketStatus as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      const response = await PATCH(request, mockParams)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal Server Error' })
    })
  })
}) 