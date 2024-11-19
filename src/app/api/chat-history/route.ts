import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username')
        
        console.log('Fetching chat history for username:', username)
        
        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            )
        }

        const client = await connectToDatabase()
        const db = client.db('dialogix')
        
        // Tìm lịch sử chat của user
        const userChatHistory = await db.collection('chatHistory')
            .findOne({ username })

        console.log('Found chat history:', userChatHistory)
        return NextResponse.json(userChatHistory ? userChatHistory.chats : [])
    } catch (error) {
        console.error('Error in GET /api/chat-history:', error)
        return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { username, chatHistory } = await request.json()
        
        console.log('Saving chat history for username:', username)
        console.log('Chat history to save:', chatHistory)

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            )
        }

        const client = await connectToDatabase()
        const db = client.db('dialogix')
        
        // Cập nhật hoặc tạo mới lịch sử chat
        const result = await db.collection('chatHistory').updateOne(
            { username },
            { 
                $set: { 
                    username,
                    chats: chatHistory,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        )

        console.log('Save result:', result)
        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('Error in POST /api/chat-history:', error)
        return NextResponse.json({ error: 'Failed to save chat history' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { username, chatId } = await request.json();
        
        console.log('Deleting chat for username:', username);
        console.log('Chat ID to delete:', chatId);

        if (!username || !chatId) {
            return NextResponse.json(
                { error: 'Username and chatId are required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();
        const db = client.db('dialogix');
        
        // Lấy chat history hiện tại
        const userChatHistory = await db.collection('chatHistory').findOne({ username });
        
        if (!userChatHistory) {
            return NextResponse.json({ error: 'Chat history not found' }, { status: 404 });
        }

        // Lọc bỏ chat cần xóa
        const updatedChats = userChatHistory.chats.filter(
            (chat: any) => chat.id !== chatId
        );

        // Cập nhật lại chat history
        const result = await db.collection('chatHistory').updateOne(
            { username },
            { 
                $set: { 
                    chats: updatedChats,
                    updatedAt: new Date()
                }
            }
        );

        console.log('Delete result:', result);
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error in DELETE /api/chat-history:', error);
        return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { username, chatId, newTitle } = await request.json();
        
        console.log('Updating chat title for username:', username);
        console.log('Chat ID:', chatId);
        console.log('New title:', newTitle);

        if (!username || !chatId || !newTitle) {
            return NextResponse.json(
                { error: 'Username, chatId and newTitle are required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();
        const db = client.db('dialogix');
        
        // Lấy chat history hiện tại
        const userChatHistory = await db.collection('chatHistory').findOne({ username });
        
        if (!userChatHistory) {
            return NextResponse.json({ error: 'Chat history not found' }, { status: 404 });
        }

        // Cập nhật title của chat
        const updatedChats = userChatHistory.chats.map((chat: any) => 
            chat.id === chatId ? { ...chat, title: newTitle } : chat
        );

        // Lưu lại vào database
        const result = await db.collection('chatHistory').updateOne(
            { username },
            { 
                $set: { 
                    chats: updatedChats,
                    updatedAt: new Date()
                }
            }
        );

        console.log('Update result:', result);
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error in PATCH /api/chat-history:', error);
        return NextResponse.json({ error: 'Failed to update chat title' }, { status: 500 });
    }
} 