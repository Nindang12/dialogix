import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
    try {
        const { title, userId } = await request.json()
        
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        const conversation = {
            title,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await db.collection('chatConversations').insertOne(conversation)

        return NextResponse.json({
            ...conversation,
            _id: result.insertedId
        })

    } catch (error) {
        console.error('Create conversation error:', error)
        return NextResponse.json(
            { error: 'Không thể tạo cuộc trò chuyện' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Thiếu userId' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        const conversations = await db.collection('chatConversations')
            .find({ userId: new ObjectId(userId) })
            .sort({ updatedAt: -1 })
            .toArray()

        return NextResponse.json(conversations)

    } catch (error) {
        console.error('Get conversations error:', error)
        return NextResponse.json(
            { error: 'Không thể lấy danh sách cuộc trò chuyện' },
            { status: 500 }
        )
    }
} 