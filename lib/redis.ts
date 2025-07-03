import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis environment variables')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export type Ticket = {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'closed'
  createdAt: string
  updatedAt: string
  responses: Response[]
}

export type Response = {
  id: string
  content: string
  createdAt: string
}

export const TICKETS_KEY = 'tickets'

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'responses'>) {
  try {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const newTicket: Ticket = {
      ...ticket,
      id,
      createdAt: now,
      updatedAt: now,
      responses: [],
    }

    // Store as an object, Redis will handle serialization
    await redis.set(`ticket:${id}`, newTicket)
    await redis.zadd(TICKETS_KEY, { score: Date.now(), member: id })
    
    return newTicket
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

export async function getTickets(start = 0, end = -1) {
  try {
    const ids = await redis.zrange(TICKETS_KEY, start, end, { rev: true })

    if (!ids || ids.length === 0) {
      return []
    }

    const tickets = await Promise.all(
      ids.map(async (id) => {
        try {
          const ticket = await redis.get(`ticket:${id}`)
          
          if (!ticket) {
            return null
          }

          // Handle both string and object responses from Redis
          const parsedTicket = typeof ticket === 'string' ? JSON.parse(ticket) : ticket
          return parsedTicket as Ticket
        } catch (error) {
          console.error(`Error processing ticket ${id}:`, error)
          return null
        }
      })
    )

    // Filter out any null tickets from errors
    const validTickets = tickets.filter((ticket): ticket is Ticket => ticket !== null)
    return validTickets
  } catch (error) {
    console.error('Error in getTickets:', error)
    throw error
  }
}

export async function getTicket(id: string) {
  const ticket = await redis.get(`ticket:${id}`)
  return ticket ? (ticket as Ticket) : null
}

export async function deleteTicket(id: string) {
  await redis.del(`ticket:${id}`)
  await redis.zrem(TICKETS_KEY, id)
}

export async function addResponse(ticketId: string, content: string) {
  const ticket = await getTicket(ticketId)
  if (!ticket) throw new Error('Ticket not found')

  const response: Response = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
  }

  ticket.responses.push(response)
  ticket.updatedAt = new Date().toISOString()
  
  await redis.set(`ticket:${ticketId}`, JSON.stringify(ticket))
  return response
}

export async function updateTicketStatus(ticketId: string, status: Ticket['status']) {
  const ticket = await getTicket(ticketId)
  if (!ticket) throw new Error('Ticket not found')

  ticket.status = status
  ticket.updatedAt = new Date().toISOString()
  
  await redis.set(`ticket:${ticketId}`, JSON.stringify(ticket))
  return ticket
} 