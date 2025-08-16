import { NextResponse } from 'next/server'
import { getTicket, deleteTicket, updateTicketStatus, addResponse } from '@/lib/redis'
import { z } from 'zod'

const responseSchema = z.object({
  content: z.string().min(1).max(1000),
})

const statusSchema = z.object({
  status: z.enum(['open', 'in-progress', 'closed']),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await getTicket(params.id)
    if (!ticket) {
      return new NextResponse(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new NextResponse(JSON.stringify(ticket), {
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTicket(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Handle status update
    if ('status' in body) {
      const validatedData = statusSchema.parse(body)
      const ticket = await updateTicketStatus(params.id, validatedData.status)
      return new NextResponse(JSON.stringify(ticket), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Handle response addition
    if ('content' in body) {
      const { content } = responseSchema.parse(body)
      const response = await addResponse(params.id, content)
      return new NextResponse(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
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