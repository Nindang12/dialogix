import { useState, useEffect } from 'react';

export default function TypewriterEffect({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < content.length) {
        setDisplayedContent(prev => prev + content[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [content]);

  return <>{displayedContent}</>;
}