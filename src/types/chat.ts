export interface Message {
    _id?: string;
    sender: string;
    content: string;
    timestamp: Date;
    conversationId: string;
}

export interface Conversation {
    _id?: string;
    participants: string[];
    lastMessage?: string;
    createdAt: Date;
    updatedAt: Date;
} 