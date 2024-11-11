interface BotResponse {
    [key: string]: string | ((message: string) => string)
}

const botResponses: BotResponse = {
    // Greetings
    'xin chào': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'hello': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'hi': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    'chào': 'Xin chào! Tôi có thể giúp gì cho bạn?',
    
    // Farewells
    'tạm biệt': 'Tạm biệt! Hẹn gặp lại bạn!',
    'bye': 'Tạm biệt! Hẹn gặp lại bạn!',
    'goodbye': 'Tạm biệt! Hẹn gặp lại bạn!',
    
    // Questions
    'bạn là ai': 'Tôi là bot trợ giúp, được tạo ra để hỗ trợ bạn.',
    'bạn tên gì': 'Tôi là bot trợ giúp, bạn có thể gọi tôi là Assistant.',
    'bạn có thể làm gì': 'Tôi có thể trò chuyện và giúp bạn trả lời các câu hỏi cơ bản.',
    
    // Common phrases
    'cảm ơn': 'Không có gì! Tôi rất vui khi được giúp bạn.',
    'thank you': 'Không có gì! Tôi rất vui khi được giúp bạn.',
    'thanks': 'Không có gì! Tôi rất vui khi được giúp bạn.',
    
    // Time-based responses
    'mấy giờ': () => `Bây giờ là ${new Date().toLocaleTimeString('vi-VN')}`,
    'hôm nay': () => `Hôm nay là ${new Date().toLocaleDateString('vi-VN')}`,
}

const defaultResponses = [
    'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?',
    'Tôi chưa được lập trình để hiểu câu hỏi này. Bạn có thể hỏi điều khác không?',
    'Tôi không chắc mình hiểu ý bạn. Bạn có thể diễn đạt theo cách khác không?',
    'Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy thử hỏi điều khác nhé!',
]

export async function getBotResponse(message: string): Promise<string> {
    // Convert message to lowercase for case-insensitive matching
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
        return 'Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi này. Bạn có thể hỏi điều khác không?'
    }

    // Return random default response if no match is found
    const randomIndex = Math.floor(Math.random() * defaultResponses.length)
    return defaultResponses[randomIndex]
}

// Helper function to check if a message contains any greeting words
export function isGreeting(message: string): boolean {
    const greetings = ['xin chào', 'hello', 'hi', 'chào', 'hey']
    return greetings.some(greeting => message.toLowerCase().includes(greeting))
}

// Helper function to check if a message contains any farewell words
export function isFarewell(message: string): boolean {
    const farewells = ['tạm biệt', 'bye', 'goodbye', 'bái bai']
    return farewells.some(farewell => message.toLowerCase().includes(farewell))
} 