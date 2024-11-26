'use client';
import TypewriterEffect from '@/components/TypewriterEffect';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBotResponse } from '@/lib/botHandler';
import { useRouter, useSearchParams } from 'next/navigation';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
}

interface SummarizeSuggestion {
  type: string;
  text: string;
}

const TOKEN_VALIDATE_INTERVAL = 5 * 60 * 1000; // 5 phút
let lastValidateTime = 0;

export default function Home() {
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SummarizeSuggestion[]>([]);

  const handleSendMessage = async (message: string) => {
    if (!message || !message.trim()) {
      return;
    }

    setIsChatting(true);
    const newUserMessage: Message = { type: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(message);
      const newBotMessage: Message = { type: 'bot', content: botResponse };
      
      setMessages(prev => [...prev, newBotMessage]);

      if (isLoggedIn) {
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
            title: message.length > 30 ? message.substring(0, 30) + '...' : message,
            messages: [newUserMessage, newBotMessage]
          }]);
          setCurrentChatId(newChatId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: error instanceof Error 
          ? `Lỗi: ${error.message}` 
          : 'Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
        
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setIsLoggedIn(false);
        return;
      }

      // Chỉ validate token nếu đã qua interval hoặc chưa validate lần nào
      const now = Date.now();
      if (now - lastValidateTime < TOKEN_VALIDATE_INTERVAL && lastValidateTime !== 0) {
        setIsLoggedIn(true);
        return;
      }

      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        lastValidateTime = now;
        setIsLoggedIn(true);
        
        // Load chat history chỉ khi cần thiết
        if (chatHistory.length === 0) {
          try {
            const userData = JSON.parse(userStr);
            const historyResponse = await fetch(`/api/chat-history?username=${userData.username}`);
            const historyData = await historyResponse.json();
            
            if (historyResponse.ok && Array.isArray(historyData)) {
              setChatHistory(historyData);
            }
          } catch (error) {
            console.error('Failed to load chat history:', error);
          }
        }
      } else {
        handleLogout();
      }

    } catch (error) {
      console.error('Error checking login status:', error);
      handleLogout();
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const saveChatHistory = async () => {
      if (!isLoggedIn || chatHistory.length === 0) return;

      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      try {
        const userData = JSON.parse(userStr);
        const response = await fetch('/api/chat-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userData.username,
            chatHistory: chatHistory,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save chat history:', await response.json());
        }
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    };

    // Debounce save operation
    const timeoutId = setTimeout(saveChatHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [chatHistory, isLoggedIn]);

  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && isLoggedIn && chatHistory.length > 0) {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setMessages(chat.messages);
        setIsChatting(true);
      }
    }
  }, [searchParams, isLoggedIn, chatHistory]);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setChatHistory([]);
      setCurrentChatId(null);
      setMessages([]);
      setIsChatting(false);
    }
  };

  const startNewChat = () => {
    router.push('/');
    setCurrentChatId(null);
    setMessages([]);
    setIsChatting(false);
    setInputValue('');
  };

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      router.push(`/?chat=${chatId}`);
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setIsChatting(true);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn Link navigate
    if (confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const userData = JSON.parse(userStr);
        
        // Xóa chat khỏi state
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        // Nếu đang ở chat bị xóa, chuyển về new chat
        if (currentChatId === chatId) {
          startNewChat();
        }

        // Cập nhật lên server
        const response = await fetch('/api/chat-history', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userData.username,
            chatId
          }),
        });

        if (!response.ok) {
          console.error('Failed to delete chat:', await response.json());
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  const handleRenameChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingChatId(chatId);
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setNewTitle(chat.title);
    }
  };

  const saveNewTitle = async (chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const userData = JSON.parse(userStr);
      
      // Cập nhật state local
      setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));

      // Gửi request cập nhật lên server
      const response = await fetch('/api/chat-history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          chatId,
          newTitle: newTitle.trim()
        }),
      });

      if (!response.ok) {
        console.error('Failed to rename chat:', await response.json());
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
    } finally {
      setEditingChatId(null);
      setNewTitle('');
    }
  };

  const handleSummarizeText = (type: string) => {
    let prompt = '';
    let newSuggestions: SummarizeSuggestion[] = [];
    
    switch (type) {
      case 'long':
        newSuggestions = [
          { type: 'long', text: 'Tóm tắt tác phẩm Chí Phèo của Nam Cao' },
          { type: 'long', text: 'Tóm tắt truyện Số Đỏ của Vũ Trọng Phụng' },
          { type: 'long', text: 'Tóm tắt Truyện Kiều của Nguyễn Du' }
        ];
        break;
      case 'paragraph':
        newSuggestions = [
          { type: 'paragraph', text: 'Tóm tắt đoạn văn về biến đổi khí hậu' },
          { type: 'paragraph', text: 'Tóm tắt đoạn văn về ô nhiễm môi trường' },
          { type: 'paragraph', text: 'Tóm tắt đoạn văn về phát triển bền vững' }
        ];
        break;
      case 'article':
        newSuggestions = [
          { type: 'article', text: 'Tóm tắt bài báo về trí tuệ nhân tạo' },
          { type: 'article', text: 'Tóm tắt bài báo về công nghệ blockchain' },
          { type: 'article', text: 'Tóm tắt bài báo về xu hướng công nghệ 2024' }
        ];
        break;
      case 'document':
        newSuggestions = [
          { type: 'document', text: 'Tóm tắt tài liệu về lịch sử Việt Nam' },
          { type: 'document', text: 'Tóm tắt tài liệu về kinh tế vĩ mô' },
          { type: 'document', text: 'Tóm tắt tài liệu về marketing căn bản' }
        ];
        break;
      case 'content':
        newSuggestions = [
          { type: 'content', text: 'Tóm tắt nội dung về cách viết CV xin việc' },
          { type: 'content', text: 'Tóm tắt nội dung về kỹ năng thuyết trình' },
          { type: 'content', text: 'Tóm tắt nội dung về phương pháp học tập hiệu quả' }
        ];
        break;
    }
    setInputValue(prompt);
    setSuggestions(newSuggestions);
    
    // Focus vào input
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleSuggestionClick = (suggestion: SummarizeSuggestion) => {
    const prompt = `${inputValue}${suggestion.text}`;
    setInputValue(prompt);
    setSuggestions([]); // Ẩn suggestions sau khi chọn
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white flex justify-between items-center p-4 border-b shadow-sm">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/assets/avtBotchat.png" alt="ChatGPT Icon" className="w-8 h-8" />
          <span className="font-bold text-black text-lg">Dialogix</span>
        </Link>
        <div className="space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-black font-medium">
                  {typeof window !== 'undefined' && localStorage.getItem('user') 
                    ? JSON.parse(localStorage.getItem('user')!).username
                    : ''}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-black hover:bg-gray-800 transition-colors text-white px-4 py-2 rounded-lg"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="bg-black hover:bg-gray-800 transition-colors text-white px-4 py-2 rounded-lg">
                Đăng nhập
              </Link>
              <Link href="/register" className="border border-black hover:bg-gray-100 transition-colors text-black px-4 py-2 rounded-lg">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 mt-16 mb-16 bg-white text-black">
        <div className="flex h-[calc(100vh-132px)]">
          {isLoggedIn && chatHistory.length > 0 &&  (
            <div className="w-1/6 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b">
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-center space-x-2 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Chat</span>
                </button>
              </div>
              <div className="overflow-y-auto">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="relative group">
                    {editingChatId === chat.id ? (
                      <form 
                        onSubmit={(e) => saveNewTitle(chat.id, e)}
                        className="p-3 bg-gray-50 flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="flex-1 p-1 border rounded"
                          autoFocus
                          onBlur={() => setEditingChatId(null)}
                        />
                        <button
                          type="submit"
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </form>
                    ) : (
                      <Link 
                        href={`/?chat=${chat.id}`}
                        className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3 ${
                          currentChatId === chat.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="truncate flex-1">{chat.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                          <button
                            onClick={(e) => handleRenameChat(chat.id, e)}
                            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                            title="Đổi tên"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                            title="Xóa cuộc trò chuyện"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col">
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
                      setSuggestions([]); // Ẩn suggestions khi gửi tin nhắn
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    handleSendMessage(inputValue);
                    setSuggestions([]); // Ẩn suggestions khi gửi tin nhắn
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <img width={25} src="/assets/up-arrow.svg" alt="up arrow" />
                </button>
              </div>
              
              {/* Hiển thị suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      {suggestion.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center space-x-2 mt-4">
              <button 
                onClick={() => handleSummarizeText('long')}
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full shadow-sm mb-2 transition-colors"
              >
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span className="text-blue-700">Tóm tắt văn bản dài</span>
              </button>
              <button 
                onClick={() => handleSummarizeText('paragraph')}
                className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-full shadow-sm mb-2 transition-colors"
              >
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span className="text-green-700">Tóm tắt đoạn văn</span>
              </button>
              <button 
                onClick={() => handleSummarizeText('article')}
                className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-full shadow-sm mb-2 transition-colors"
              >
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span className="text-purple-700">Tóm tắt bài báo</span>
              </button>
              <button 
                onClick={() => handleSummarizeText('document')}
                className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-full shadow-sm mb-2 transition-colors"
              >
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span className="text-orange-700">Tóm tắt tài liệu</span>
              </button>
              <button 
                onClick={() => handleSummarizeText('content')}
                className="flex items-center space-x-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-4 py-2 rounded-full shadow-sm mb-2 transition-colors"
              >
                <img width={25} src="/assets/docfile.svg" alt="docfile" />
                <span className="text-pink-700">Tóm tắt nội dung</span>
              </button>
            </div>
          </div>
        ) : (
              <div className="flex h-[calc(100vh-132px)]">
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
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <img 
                          src="/assets/avtBotchat.png" 
                          alt="ChatGPT Avatar"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
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
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 text-center text-gray-500 text-sm">
        Bằng cách nhắn tin cho ChatGPT, bạn đồng ý với <a href="#" className="underline">Điều khoản</a> và đã đọc <a href="#" className="underline">Chính sách riêng tư</a> của chúng tôi.
      </footer>
    </div>
  );
}