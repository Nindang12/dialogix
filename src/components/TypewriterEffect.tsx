"use client"
import { useState, useEffect } from 'react'

interface TypewriterEffectProps {
    content: string
}

export default function TypewriterEffect({ content }: TypewriterEffectProps) {
    const [displayedContent, setDisplayedContent] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!content) return // Kiểm tra nếu content rỗng

        if (currentIndex < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedContent(prev => prev + content[currentIndex])
                setCurrentIndex(currentIndex + 1)
            }, 30)

            return () => clearTimeout(timeout)
        }
    }, [currentIndex, content])

    // Reset effect khi content thay đổi
    useEffect(() => {
        setDisplayedContent('')
        setCurrentIndex(0)
    }, [content])

    // Chỉ return displayedContent, không return thêm gì khác
    return displayedContent
}