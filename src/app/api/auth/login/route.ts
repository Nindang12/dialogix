import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()
        console.log('Login attempt for username:', username)

        const client = await connectToDatabase()
        const db = client.db('dialogix')
        
        // Find user
        const user = await db.collection('users').findOne({ username })
        console.log('User found:', user ? 'yes' : 'no')

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        console.log('Password valid:', isValid)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        // Generate token
        const token = jwt.sign(
            { username: user.username, id: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        console.log('Token generated successfully')

        // Create response with token
        const response = NextResponse.json({
            success: true,
            username: user.username,
            token
        })

        // Set cookie with token
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: false, // Changed to false to allow JS access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed to lax for better compatibility
            path: '/',
            maxAge: 86400 // 24 hours
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 