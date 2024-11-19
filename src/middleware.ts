import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    console.log('API Request:', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers)
    })
    
    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
} 