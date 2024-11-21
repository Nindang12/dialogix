interface BotResponse {
    message: string;
    summary?: string;
    error?: string;
}

export async function getBotResponse(message: string): Promise<string> {
    try {
        // Validate input
        if (!message || message.trim().length === 0) {
            return 'Vui lòng nhập nội dung tin nhắn';
        }

        const trimmedMessage = message.trim();

        // Thêm timeout cho request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('http://192.168.10.234:5000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                sentence: trimmedMessage // Thay đổi từ 'text' thành 'sentence' theo API spec
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const data: BotResponse = await response.json();

        // Check if we have a valid response
        if (!data) {
            throw new Error('Invalid response format from API');
        }

        // Return response data
        if (data.error) {
            throw new Error(data.error);
        }

        return data.message || data.summary || 'Không có phản hồi từ server';

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