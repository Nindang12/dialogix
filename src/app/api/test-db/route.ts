import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)
        
        // Thử kết nối và query
        const test = await db.command({ ping: 1 })
        
        return NextResponse.json({
            message: 'Kết nối MongoDB thành công',
            test
        })
    } catch (error) {
        console.error('Database connection error:', error)
        return NextResponse.json(
            { error: 'Không thể kết nối đến database' },
            { status: 500 }
        )
    }
} 