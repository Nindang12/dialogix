import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()
        
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        
        // Find user by username or email
        const user = await db.collection('users').findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Mật khẩu không đúng' },
                { status: 401 }
            )
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        )

        return NextResponse.json({ token, user: {
            username: user.username,
            email: user.email,
            _id: user._id
        }})

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi trong quá trình đăng nhập' },
            { status: 500 }
        )
    }
} 