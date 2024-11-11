interface BotResponse {
    [key: string]: string | ((message: string) => string)
}

const botResponses: BotResponse = {
    // Greetings - without mentioning user
    'xin chào': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'hello': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'hi': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'chào': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    
    // Farewells - generic responses
    'tạm biệt': 'Tạm biệt! Hẹn gặp lại!',
    'bye': 'Tạm biệt! Hẹn gặp lại!',
    'goodbye': 'Tạm biệt! Hẹn gặp lại!',
    
    // Questions - generic responses
    'bạn là ai': 'Tôi là bot trợ giúp, được tạo ra để hỗ trợ trong cuộc trò chuyện.',
    'bạn tên gì': 'Tôi là bot trợ giúp.',
    'bạn có thể làm gì': 'Tôi có thể trò chuyện và giúp trả lời các câu hỏi cơ bản.',
    
    // Common phrases - generic responses
    'cảm ơn': 'Rất vui khi được giúp đỡ!',
    'thank you': 'Rất vui khi được giúp đỡ!',
    'thanks': 'Rất vui khi được giúp đỡ!',
    
    // Time-based responses
    'mấy giờ': () => `Bây giờ là ${new Date().toLocaleTimeString('vi-VN')}`,
    'hôm nay': () => `Hôm nay là ${new Date().toLocaleDateString('vi-VN')}`,
}

const defaultResponses = [
    'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?',
    'Tôi chưa được lập trình để hiểu câu hỏi này.',
    'Tôi không chắc mình hiểu ý. Bạn có thể diễn đạt theo cách khác không?',
    'Xin lỗi, tôi không thể trả lời câu hỏi này.',
]

export async function getBotResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim()
    
    // Check for exact matches
    for (const [key, response] of Object.entries(botResponses)) {
        if (lowerMessage.includes(key)) {
            if (typeof response === 'function') {
                return response(message)
            }
            return response
        }
    }

    // Check for question words
    if (lowerMessage.includes('?') || 
        lowerMessage.includes('như thế nào') || 
        lowerMessage.includes('là gì') || 
        lowerMessage.includes('ở đâu')) {
        return 'Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi này.'
    }

    // Return random default response
    const randomIndex = Math.floor(Math.random())
    return defaultResponses[randomIndex]
}