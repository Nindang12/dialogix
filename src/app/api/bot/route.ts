import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: 'Vui lòng nhập nội dung tin nhắn' });
        }

        const trimmedMessage = message.trim().toLowerCase();
        let completion;

        // Xử lý yêu cầu tóm tắt văn bản
        if (trimmedMessage.includes('tóm tắt')) {
            const textToSummarize = message.replace(/tóm tắt/i, '').trim();
            
            completion = await openai.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "Bạn là một trợ lý AI chuyên tóm tắt văn bản. Hãy tóm tắt nội dung sau một cách ngắn gọn, súc tích bằng Tiếng Việt." 
                    },
                    { 
                        role: "user", 
                        content: textToSummarize 
                    }
                ],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 300,
            });
        } else {
            completion = await openai.chat.completions.create({
                messages: [
                    { 
                        role: "system", 
                        content: "Bạn là một trợ lý AI thông minh và thân thiện. Hãy trả lời bằng Tiếng Việt một cách ngắn gọn, dễ hiểu." 
                    },
                    { 
                        role: "user", 
                        content: message 
                    }
                ],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 500,
            });
        }

        return NextResponse.json({ 
            message: completion.choices[0]?.message?.content || 'Không có phản hồi'
        });

    } catch (error) {
        console.error('Error in bot API:', error);
        return NextResponse.json(
            { error: 'Đã có lỗi xảy ra khi xử lý yêu cầu' },
            { status: 500 }
        );
    }
} 