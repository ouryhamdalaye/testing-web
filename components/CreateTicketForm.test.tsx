/**
 * @fileoverview Unit tests for the CreateTicketForm component
 * @package components
 * 
 * @test-type Integration
 * @test-coverage Component, Form Submission, Error Handling, UI States
 * @test-framework Jest + React Testing Library
 * 
 * @description
 * This test suite validates the CreateTicketForm component functionality including:
 * - Form rendering and field presence
 * - Form submission and API interaction
 * - Error handling and user feedback
 * - Loading states and button behavior
 * 
 * @testing-strategy
 * Uses React Testing Library's user-event for realistic user interactions.
 * Mocks fetch API for controlled testing of network requests.
 * Tests both success and error paths.
 * Validates loading states and UI feedback.
 * 
 * @mocks
 * - global.fetch: Mocked for API call testing
 * - console.error: Suppressed during error tests
 * - window.alert: Mocked for error message testing
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
import CreateTicketForm from './CreateTicketForm'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('CreateTicketForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields', () => {
    render(<CreateTicketForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument()
  })

  it('submits form data correctly', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({ ok: true })
    
    render(<CreateTicketForm />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    expect(mockFetch).toHaveBeenCalledWith('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Ticket',
        description: 'Test Description',
      }),
    })
  })

  it('shows error message on failed submission', async () => {
    const user = userEvent.setup()
    mockFetch.mockRejectedValueOnce(new Error('Failed to create ticket'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const alertMock = jest.spyOn(window, 'alert').mockImplementation()
    
    render(<CreateTicketForm />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.click(screen.getByRole('button', { name: /create ticket/i }))

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to create ticket')
    })

    consoleSpy.mockRestore()
    alertMock.mockRestore()
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<CreateTicketForm />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent(/creating/i)

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent(/create ticket/i)
    })
  })
}) 