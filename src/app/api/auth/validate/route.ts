import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cache để lưu kết quả validate token
const tokenCache = new Map<string, {
    decoded: any,
    expires: number
}>();

// Thời gian cache (5 phút)
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        // Kiểm tra cache trước
        const cachedResult = tokenCache.get(token)
        if (cachedResult && Date.now() < cachedResult.expires) {
            return NextResponse.json({ valid: true, user: cachedResult.decoded })
        }

        // Nếu không có trong cache hoặc đã hết hạn, verify token
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
        
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            tokenCache.delete(token) // Xóa khỏi cache nếu hết hạn
            return NextResponse.json({ error: 'Token expired' }, { status: 401 })
        }

        // Lưu kết quả vào cache
        tokenCache.set(token, {
            decoded,
            expires: Date.now() + CACHE_DURATION
        })

        return NextResponse.json({ valid: true, user: decoded })

    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}
