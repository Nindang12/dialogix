import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
    try {
        const { sender, content, conversationId } = await request.json()
        
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        // Save the message
        const result = await db.collection('messages').insertOne({
            sender,
            content,
            conversationId: new ObjectId(conversationId),
            timestamp: new Date()
        })

        // Update the conversation's last message and timestamp
        await db.collection('conversations').updateOne(
            { _id: new ObjectId(conversationId) },
            { 
                $set: {
                    lastMessage: content,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json({
            messageId: result.insertedId,
            message: 'Tin nhắn đã được gửi'
        })

    } catch (error) {
        console.error('Save message error:', error)
        return NextResponse.json(
            { error: 'Không thể gửi tin nhắn' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const conversationId = searchParams.get('conversationId')
        
        if (!conversationId) {
            return NextResponse.json(
                { error: 'ConversationId is required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        const messages = await db.collection('messages')
            .find({ conversationId: new ObjectId(conversationId) })
            .sort({ timestamp: 1 })
            .toArray()

        return NextResponse.json(messages)

    } catch (error) {
        console.error('Get messages error:', error)
        return NextResponse.json(
            { error: 'Không thể lấy tin nhắn' },
            { status: 500 }
        )
    }
} 