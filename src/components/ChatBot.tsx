"use client"
import { useState, useEffect, useRef } from 'react'
import { getBotResponse } from '@/lib/botHandler'
import TypewriterEffect from './TypewriterEffect'

interface Message {
    _id?: string
    content: string
    isBot: boolean
    timestamp: Date
    conversationId: string
}

interface Conversation {
    _id: string
    title: string
    lastMessage?: string
    createdAt: Date
    updatedAt: Date
}

export default function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadConversations()
    }, [])

    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId)
        }
    }, [currentConversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const loadConversations = async () => {
        try {
            const userId = localStorage.getItem('userId')
            const response = await fetch(`/api/chat/conversations?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                setConversations(data)
            }
        } catch (error) {
            console.error('Error loading conversations:', error)
        }
    }

    const loadMessages = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
            if (response.ok) {
                const data = await response.json()
                setMessages(data)
            }
        } catch (error) {
            console.error('Error loading messages:', error)
        }
    }

    const createNewConversation = async (title: string) => {
        try {
            const userId = localStorage.getItem('userId')
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, userId })
            })
            if (response.ok) {
                const data = await response.json()
                setCurrentConversationId(data._id)
                loadConversations()
                return data._id
            }
        } catch (error) {
            console.error('Error creating conversation:', error)
        }
    }

    const saveMessage = async (content: string, isBot: boolean, conversationId: string) => {
        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, isBot, conversationId })
            })
            if (response.ok) {
                return await response.json()
            }
        } catch (error) {
            console.error('Error saving message:', error)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim()) return

        let activeConversationId = currentConversationId
        if (!activeConversationId) {
            // Create new conversation with first message as title
            activeConversationId = await createNewConversation(newMessage.trim())
        }

        if (!activeConversationId) return

        // Save user message
        const savedUserMessage = await saveMessage(newMessage.trim(), false, activeConversationId)
        if (savedUserMessage) {
            setMessages(prev => [...prev, savedUserMessage])
        }

        setNewMessage('')
        setIsTyping(true)

        try {
            // Get bot response
            const botResponseText = await getBotResponse(newMessage.trim())
            
            // Save bot message
            const savedBotMessage = await saveMessage(botResponseText, true, activeConversationId)
            if (savedBotMessage) {
                setMessages(prev => [...prev, savedBotMessage])
            }
            
        } catch (error) {
            console.error('Error getting bot response:', error)
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="flex h-screen">
            {/* Chat History Sidebar */}
            <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Lịch sử chat</h2>
                {conversations.map((chat) => (
                    <div
                        key={chat._id}
                        className="p-2 hover:bg-gray-200 cursor-pointer rounded"
                        onClick={() => setCurrentConversationId(chat._id)}
                    >
                        {chat.title}
                    </div>
                ))}
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
                <div className="bg-blue-500 text-white p-4">
                    <h1 className="text-xl font-bold">Bot Trợ Giúp</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                    message.isBot
                                        ? 'bg-gray-200'
                                        : 'bg-blue-500 text-white'
                                }`}
                            >
                                {message.isBot ? (
                                    <TypewriterEffect content={message.content || ''} />
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 px-4 py-2 rounded-lg">
                                Đang nhập...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 