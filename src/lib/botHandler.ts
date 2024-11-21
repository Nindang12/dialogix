import OpenAI from 'openai';

interface BotResponse {
    message: string;
    summary?: string;
    error?: string;
}

// Khởi tạo OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getBotResponse(message: string): Promise<string> {
    try {
        if (!message || message.trim().length === 0) {
            return 'Vui lòng nhập nội dung tin nhắn';
        }

        const trimmedMessage = message.trim().toLowerCase();

        // Xử lý yêu cầu tóm tắt văn bản
        if (trimmedMessage.includes('tóm tắt')) {
            const textToSummarize = message.replace(/tóm tắt/i, '').trim();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('http://192.168.10.234:5000/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    sentence: textToSummarize
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const data: BotResponse = await response.json();
            return data.message || data.summary || 'Không có phản hồi từ server';
        }

        // Sử dụng OpenAI API cho các câu hỏi khác
        try {
            const completion = await openai.chat.completions.create({
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

            return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Không thể kết nối với OpenAI API');
        }

    } catch (error) {
        console.error('Error in getBotResponse:', error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.';
            }
            return `Xin lỗi, đã có lỗi xảy ra: ${error.message}`;
        }
        return 'Xin lỗi, đã có lỗi không xác định xảy ra. Vui lòng thử lại sau.';
    }
}