import { NextResponse } from 'next/server'
import { createTicket, getTickets } from '@/lib/redis'
import { z } from 'zod'

const ticketSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  status: z.enum(['open', 'in-progress', 'closed']).default('open'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = ticketSchema.parse(body)
    const ticket = await createTicket(validatedData)
    return new NextResponse(JSON.stringify(ticket), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET() {
  try {
    const tickets = await getTickets()
    return new NextResponse(JSON.stringify(tickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 