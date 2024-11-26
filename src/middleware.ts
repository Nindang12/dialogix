import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    if (request.url.includes('/api/auth/') || request.url.includes('/api/chat-history')) {
        console.log('Important API Request:', request.url);
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/auth/:path*',
        '/api/chat-history/:path*',
        '/api/messages/:path*'
    ]
} 