'use client'

import { useState } from 'react'
import { Ticket } from '@/lib/redis'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
  open: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState('')

  async function handleStatusChange(newStatus: Ticket['status']) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      window.location.reload()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAddResponse(e: React.FormEvent) {
    e.preventDefault()
    if (!response.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: response }),
      })
      if (!res.ok) throw new Error('Failed to add response')
      setResponse('')
      window.location.reload()
    } catch (error) {
      console.error('Error adding response:', error)
      alert('Failed to add response')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDistanceToNow(new Date(ticket.createdAt))} ago
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[ticket.status]
            }`}
          >
            {ticket.status}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-700">{ticket.description}</p>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>

          {!isExpanded && ticket.responses.length > 0 && (
            <span className="text-sm text-gray-500">
              {ticket.responses.length} response{ticket.responses.length !== 1 && 's'}
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
              <div className="flex items-center space-x-2">
                {(['open', 'in-progress', 'closed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isSubmitting || ticket.status === status}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === status
                        ? statusColors[status]
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Responses</h4>
              {ticket.responses.length > 0 ? (
                <div className="space-y-3">
                  {ticket.responses.map((response) => (
                    <div key={response.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{response.content}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(response.createdAt))} ago
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No responses yet</p>
              )}
            </div>

            <form onSubmit={handleAddResponse} className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Add Response</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="form-input flex-1 min-w-0 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !response.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 