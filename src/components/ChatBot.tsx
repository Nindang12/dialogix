"use client"
import { useState, useEffect, useRef } from 'react'
import { getBotResponse } from '@/lib/botHandler'

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

    // ... rest of the component (UI rendering) remains the same ...
} 