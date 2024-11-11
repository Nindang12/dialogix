import { useState, useEffect } from 'react';

export default function TypewriterEffect({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    // Đảm bảo content là string
    const safeContent = content || '';
    setDisplayedContent(''); // Reset content when prop changes
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < safeContent.length) {
        setDisplayedContent(prev => prev + safeContent[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 10);

    return () => {
      clearInterval(timer); // Cleanup timer
    };
  }, [content]);

  // Nếu không có content, không render gì cả
  if (!content) return null;

  return <div>{displayedContent}</div>;
}