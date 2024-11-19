import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided in Authorization header');
            return NextResponse.json({ error: 'No token provided' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log('Token verified successfully:', decoded)
        return NextResponse.json({ valid: true, user: decoded })

    } catch (error) {
        console.error('Token validation error:', error)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}
