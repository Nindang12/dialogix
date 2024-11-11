import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json()
        
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        
        // Validate input
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Vui lòng nhập đầy đủ thông tin' },
                { status: 400 }
            )
        }

        // Check if username exists
        const existingUsername = await db.collection('users').findOne({ username })
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Tên người dùng đã tồn tại' },
                { status: 400 }
            )
        }

        // Check if email exists
        const existingEmail = await db.collection('users').findOne({ email })
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email đã được sử dụng' },
                { status: 400 }
            )
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user
        const result = await db.collection('users').insertOne({
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({
            success: true,
            message: 'Đăng ký thành công',
            userId: result.insertedId
        })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi trong quá trình đăng ký' },
            { status: 500 }
        )
    }
} 