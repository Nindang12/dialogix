import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
    try {
        const { content, isBot, conversationId } = await request.json()
        
        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        const message = {
            content,
            isBot,
            timestamp: new Date(),
            conversationId: new ObjectId(conversationId)
        }

        // Save message
        await db.collection('chatMessages').insertOne(message)

        // Update conversation's lastMessage and timestamp
        await db.collection('chatConversations').updateOne(
            { _id: new ObjectId(conversationId) },
            { 
                $set: { 
                    lastMessage: content,
                    updatedAt: new Date()
                }
            }
        )

        return NextResponse.json(message)

    } catch (error) {
        console.error('Save message error:', error)
        return NextResponse.json(
            { error: 'Không thể lưu tin nhắn' },
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
                { error: 'Thiếu conversationId' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB)

        const messages = await db.collection('chatMessages')
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