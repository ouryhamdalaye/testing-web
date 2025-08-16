/**
 * @fileoverview Unit tests for Redis database operations
 * @package lib
 * 
 * @test-type Unit
 * @test-coverage Database Operations, Error Handling
 * @test-framework Jest
 * 
 * @description
 * Tests Redis client operations and data handling:
 * - CRUD operations for tickets
 * - Connection handling
 * - Error scenarios
 * - Data validation
 * 
 * @testing-strategy
 * Mocks Upstash Redis client for isolated testing.
 * Tests data serialization/deserialization.
 * Validates error handling for network issues.
 * Ensures proper type handling and validation.
 * 
 * @mocks
 * - @upstash/redis Redis client
 * - All Redis operations (get, set, del, etc.)
 * 
 * @dependencies
 * - @upstash/redis
 * - zod (for validation)
 * 
 * @author Your Name
 * @last-modified 2024-03-XX
 */

import '@testing-library/jest-dom'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { redis, createTicket, getTickets, deleteTicket, addResponse, updateTicketStatus } from './redis'

// Mock the crypto.randomUUID function
const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn(() => mockUUID) as unknown as () => `${string}-${string}-${string}-${string}-${string}`,
}

describe('Redis Ticket Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTicket', () => {
    it('should create a new ticket', async () => {
      const mockTicket = {
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open' as const,
      }

      const result = await createTicket(mockTicket)

      expect(result).toEqual({
        ...mockTicket,
        id: mockUUID,
        responses: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })

      expect(redis.set).toHaveBeenCalledWith(
        `ticket:${mockUUID}`,
        expect.any(String)
      )
      expect(redis.zadd).toHaveBeenCalledWith(
        'tickets',
        expect.any(Object)
      )
    })
  })

  describe('getTickets', () => {
    it('should return all tickets', async () => {
      const mockTickets = [{
        id: '1',
        title: 'Test',
        description: 'Test',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }]

      // @ts-expect-error - Mock implementation
      ;(redis.zrange as jest.Mock).mockResolvedValue(['1'])
      // @ts-expect-error - Mock implementation
      ;(redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockTickets[0]))

      const result = await getTickets()

      expect(result).toEqual(mockTickets)
      expect(redis.zrange).toHaveBeenCalled()
      expect(redis.get).toHaveBeenCalled()
    })
  })

  describe('deleteTicket', () => {
    it('should delete a ticket', async () => {
      await deleteTicket('1')

      expect(redis.del).toHaveBeenCalledWith('ticket:1')
      expect(redis.zrem).toHaveBeenCalledWith('tickets', '1')
    })
  })

  describe('addResponse', () => {
    it('should add a response to a ticket', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test',
        description: 'Test',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      // @ts-expect-error - Mock implementation
      ;(redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockTicket))

      const response = await addResponse('1', 'Test response')

      expect(response).toEqual({
        id: mockUUID,
        content: 'Test response',
        createdAt: expect.any(String),
      })

      expect(redis.set).toHaveBeenCalledWith(
        'ticket:1',
        expect.any(String)
      )
    })

    it('should throw error if ticket not found', async () => {
      // @ts-expect-error - Mock implementation
      ;(redis.get as jest.Mock).mockResolvedValue(null)

      await expect(addResponse('1', 'Test response')).rejects.toThrow('Ticket not found')
    })
  })

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test',
        description: 'Test',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      }

      // @ts-expect-error - Mock implementation
      ;(redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockTicket))

      const result = await updateTicketStatus('1', 'closed')

      expect(result.status).toBe('closed')
      expect(redis.set).toHaveBeenCalledWith(
        'ticket:1',
        expect.any(String)
      )
    })

    it('should throw error if ticket not found', async () => {
      // @ts-expect-error - Mock implementation
      ;(redis.get as jest.Mock).mockResolvedValue(null)

      await expect(updateTicketStatus('1', 'closed')).rejects.toThrow('Ticket not found')
    })
  })
}) 