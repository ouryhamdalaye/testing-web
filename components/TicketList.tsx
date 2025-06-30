import { Ticket } from '@/lib/redis'
import TicketCard from './TicketCard'
import { headers } from 'next/headers'

async function getTickets(): Promise<Ticket[]> {
  try {
    const headersList = headers()
    const baseUrl = headersList.get('x-forwarded-host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const url = `${protocol}://${baseUrl}/api/tickets`
    console.log('Fetching tickets from:', url)
    
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Failed to fetch tickets:', res.status, res.statusText)
      throw new Error('Failed to fetch tickets')
    }

    const data = await res.json()
    console.log('Received tickets:', data)
    return data
  } catch (error) {
    console.error('Error in getTickets:', error)
    throw error
  }
}

export default async function TicketList() {
  try {
    const tickets = await getTickets()

    if (!tickets || tickets.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tickets found</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error rendering TicketList:', error)
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg">
        <p className="text-red-500">Error loading tickets. Please try again later.</p>
      </div>
    )
  }
} 