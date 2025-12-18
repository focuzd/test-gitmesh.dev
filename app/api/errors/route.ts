import { NextRequest, NextResponse } from 'next/server'
import { serverErrorLogger } from '@/lib/error-logger.server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, error, context, level = 'error' } = body

    // Get request info
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || undefined
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               request.ip || 
               'unknown'

    // Create enhanced context with request info
    const enhancedContext = {
      ...context,
      clientSide: true,
      request: {
        method: request.method,
        url: body.url || request.url,
        userAgent,
        ip
      }
    }

    // Log the error using server logger
    await serverErrorLogger.log(
      message,
      error ? new Error(error.message) : undefined,
      enhancedContext,
      level
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log client error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    )
  }
}