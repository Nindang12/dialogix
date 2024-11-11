'use client';
import TypewriterEffect from '@/components/TypewriterEffect';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBotResponse } from '@/lib/botHandler'; // Assuming botHandler is in this location

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatHistory {
  id: string; 
  title: string;
  messages: Message[];
}

export default function Home() {
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsChatting(true);
    const newUserMessage: Message = { type: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    // Get bot response using botHandler
    const botResponse = await getBotResponse(message);
    const newBotMessage: Message = { type: 'bot', content: botResponse };
    
    // Sử dụng callback để đảm bảo có state mới nhất
    setMessages(prev => [...prev, newBotMessage]);

    // Update chat history với state mới nhất
    if (currentChatId) {
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, newUserMessage, newBotMessage] }
          : chat
      ));
    } else {
      const newChatId = Date.now().toString();
      setChatHistory(prev => [...prev, { 
        id: newChatId, 
        title: `Chat ${prev.length + 1}`, 
        messages: [newUserMessage, newBotMessage]
      }]);
      setCurrentChatId(newChatId);
    }
};

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Save chat history to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      localStorage.removeItem('user');
      setIsLoggedIn(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsChatting(false);
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setIsChatting(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <i className="fas fa-paperclip"></i>
          <span className="font-bold">ChatGPT 4.0 mini</span>
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-black">
                {JSON.parse(localStorage.getItem('user') || '{}').username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="bg-black text-white px-4 py-2 rounded">Đăng nhập</Link>
              <Link href="/register" className="border border-black text-black px-4 py-2 rounded">Đăng ký</Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 mt-16 mb-16">
        {!isChatting ? (
          <div className="h-full m-5 flex flex-col justify-center items-center gap-10">
            <h1 className="text-5xl font-bold mb-4">Can I Help You?</h1>
            <div className="relative min-w-[880px] min-h-[30px]">
              <div className="relative w-full">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tin nhắn ChatGPT" 
                  className="w-full p-4 pr-12 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      handleSendMessage(inputValue);
                    }
                  }}
                />
                <button 
                  onClick={() => handleSendMessage(inputValue)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <img width={25} src="/assets/up-arrow.svg" alt="up arrow" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center space-x-2 mt-4">
              <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-sm mb-2">
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span>Tóm tắt văn bản</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-sm mb-2">
                <img width={25} src="/assets/codefile.svg" alt="code" />
                <span>Mã</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-sm mb-2">
                <img width={25} src="/assets/lightfile.svg" alt="lightfile" />
                <span>Lên ý tưởng</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-sm mb-2">
                <img width={25} src="/assets/magic.svg" alt="magic" />
                <span>Làm tôi ngạc nhiên</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-full shadow-sm mb-2">
                <span>Thêm</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-132px)]">
            <div className="w-1/6 border-r border-gray-200 overflow-y-auto">
              <h2 className="text-lg font-semibold p-4 border-b">Chat History</h2>
              <ul>
                <li className="p-3 hover:bg-gray-100 cursor-pointer" onClick={startNewChat}>
                  <span className="font-bold">+ New Chat</span>
                </li>
                {chatHistory.map((chat) => (
                  <li 
                    key={chat.id} 
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${currentChatId === chat.id ? 'bg-gray-200' : ''}`}
                    onClick={() => loadChat(chat.id)}
                  >
                    {chat.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-8">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.type == 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    {msg.type === 'bot' && (
                      <img 
                        src="/assets/avtBotchat.png" 
                        alt="ChatGPT Avatar"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div 
                      className={`rounded-lg p-3 max-w-md ${
                        msg.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100'
                      }`}
                    >
                      {msg.type === 'user' ? (
                        msg.content
                      ) : (
                        <TypewriterEffect content={msg.content} />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t bg-white p-4">
                <div className="relative max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tin nhắn ChatGPT" 
                    className="w-full p-4 pr-12 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleSendMessage(inputValue);
                      }
                    }}
                  />
                  <button 
                    onClick={() => handleSendMessage(inputValue)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 overflow-hidden cursor-pointer"
                  >
                    <img width={25} src="/assets/up-arrow.svg" alt="up arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 text-center text-gray-500 text-sm">
        Bằng cách nhắn tin cho ChatGPT, bạn đồng ý với <a href="#" className="underline">Điều khoản</a> và đã đọc <a href="#" className="underline">Chính sách riêng tư</a> của chúng tôi.
      </footer>
    </div>
  );
}
