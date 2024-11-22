export async function getBotResponse(message: string): Promise<string> {
    try {
        const response = await fetch('/api/bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        return data.message;

    } catch (error) {
        console.error('Error in getBotResponse:', error);
        if (error instanceof Error) {
            return `Xin lỗi, đã có lỗi xảy ra: ${error.message}`;
        }
        return 'Xin lỗi, đã có lỗi không xác định xảy ra. Vui lòng thử lại sau.';
    }
}