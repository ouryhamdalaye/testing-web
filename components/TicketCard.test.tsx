/**
 * @fileoverview Unit tests for the TicketCard component
 * @package components
 * 
 * @test-type Integration
 * @test-coverage Component Rendering, User Interactions, API Integration
 * @test-framework Jest + React Testing Library
 * 
 * @description
 * Tests the TicketCard component which displays and manages individual tickets:
 * - Ticket information display
 * - Status updates
 * - Ticket deletion
 * - Response management (show/hide/add)
 * - Error handling
 * - Loading states
 * 
 * @testing-strategy
 * Uses React Testing Library's user-event for realistic user interactions:
 * - Simulates user clicks, typing, and form submissions
 * - Tests async operations with API calls
 * - Validates component state changes
 * - Tests error scenarios and user feedback
 * 
 * @mocks
 * - global.fetch: For API interactions
 * - window.confirm: For deletion confirmation
 * - window.alert: For error messages
 * - console.error: Suppressed during error tests
 * 
 * @test-data
 * Uses mockTicket fixture with:
 * - Basic ticket properties (id, title, description)
 * - Status management
 * - Timestamp handling
 * - Response array
 * 
 * @dependencies
 * - @testing-library/react
 * - @testing-library/user-event
 * 
 * @author Your Name
 * @last-modified 2024-03-XX
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketCard from './TicketCard'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock window.confirm with proper typing
const confirmSpy = jest.spyOn(window, 'confirm')

const mockTicket = {
  id: '1',
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'open' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  responses: [
    {
      id: '1',
      content: 'Test Response',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
}

describe('TicketCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders ticket information', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    expect(screen.getByText(mockTicket.title)).toBeInTheDocument()
    expect(screen.getByText(mockTicket.description)).toBeInTheDocument()
    expect(screen.getByText(mockTicket.status)).toBeInTheDocument()
  })

  it('handles status change', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({ ok: true })
    
    render(<TicketCard ticket={mockTicket} />)
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'in-progress')

    expect(mockFetch).toHaveBeenCalledWith(`/api/tickets/${mockTicket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' }),
    })
  })

  it('handles ticket deletion', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({ ok: true })
    confirmSpy.mockImplementation(() => true)
    
    render(<TicketCard ticket={mockTicket} />)
    
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledWith(`/api/tickets/${mockTicket.id}`, {
      method: 'DELETE',
    })
  })

  it('shows and hides responses', async () => {
    const user = userEvent.setup()
    render(<TicketCard ticket={mockTicket} />)
    
    // Initially responses are hidden
    expect(screen.queryByText('Test Response')).not.toBeInTheDocument()
    
    // Show responses
    await user.click(screen.getByRole('button', { name: /show responses/i }))
    expect(screen.getByText('Test Response')).toBeInTheDocument()
    
    // Hide responses
    await user.click(screen.getByRole('button', { name: /hide responses/i }))
    expect(screen.queryByText('Test Response')).not.toBeInTheDocument()
  })

  it('handles adding a new response', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({ ok: true })
    
    render(<TicketCard ticket={mockTicket} />)
    
    // Show responses section
    await user.click(screen.getByRole('button', { name: /show responses/i }))
    
    // Add new response
    await user.type(screen.getByPlaceholderText(/add a response/i), 'New Response')
    await user.click(screen.getByRole('button', { name: /submit response/i }))

    expect(mockFetch).toHaveBeenCalledWith(`/api/tickets/${mockTicket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'New Response' }),
    })
  })

  it('shows error alert on failed response submission', async () => {
    const user = userEvent.setup()
    mockFetch.mockRejectedValueOnce(new Error('Failed to add response'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()
    
    render(<TicketCard ticket={mockTicket} />)
    
    await user.click(screen.getByRole('button', { name: /show responses/i }))
    await user.type(screen.getByPlaceholderText(/add a response/i), 'New Response')
    await user.click(screen.getByRole('button', { name: /submit response/i }))

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to add response')
    })

    consoleSpy.mockRestore()
    alertMock.mockRestore()
  })
}) 