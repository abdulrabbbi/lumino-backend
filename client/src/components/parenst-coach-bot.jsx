/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2 } from 'lucide-react';
import { BASE_URL } from '../utils/api';

const ParentCoachBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hallo! Ik ben de Luumilo Ouder Coach. Ik kan je helpen geschikte activiteiten te vinden voor jouw situatie. Wat speelt er momenteel?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fixed auto-resize textarea - height control
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto first
      textareaRef.current.style.height = 'auto';
      
      // Calculate the scroll height
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Set maximum height limit (4 lines approx)
      const maxHeight = 120; // pixels
      
      // Set the height based on content but within limits
      if (scrollHeight <= maxHeight) {
        textareaRef.current.style.height = scrollHeight + 'px';
      } else {
        textareaRef.current.style.height = maxHeight + 'px';
        textareaRef.current.style.overflowY = 'auto'; // Add scroll when max height reached
      }
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        text: data.answer || 'Sorry, ik kon geen activiteiten vinden. Probeer het opnieuw met andere woorden.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: 'Er ging iets mis. Probeer het later opnieuw.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hallo! Ik ben de Luumilo Ouder Coach. Ik kan je helpen geschikte activiteiten te vinden voor jouw situatie. Wat speelt er momenteel?",
        isBot: true,
        timestamp: new Date()
      }
    ]);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Reset textarea height when chat is cleared or minimized
  useEffect(() => {
    if (textareaRef.current && inputMessage === '') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, [inputMessage]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-gradient-to-br from-[#8F34EA] to-[#2C60EB] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 sm:bottom-6 sm:right-6"
        aria-label="Open chat"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-end justify-center pb-4 px-4 sm:items-end sm:justify-end sm:pb-6 sm:pr-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Chat Container */}
          <div className={`relative w-full max-w-full sm:max-w-md bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[85vh] max-h-[600px] sm:h-[600px]'
          }`}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8F34EA] to-[#2C60EB] rounded-t-2xl p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center sm:w-10 sm:h-10">
                  <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base sm:text-lg truncate">
                    Luumilo Ouder Coach
                  </h3>
                  {!isMinimized && (
                    <p className="text-white/80 text-xs sm:text-sm truncate">
                      Online • Klaar om te helpen
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                {!isMinimized && (
                  <button
                    onClick={clearChat}
                    className="text-white/80 hover:text-white transition-colors text-xs sm:text-sm px-2 py-1 rounded hover:bg-white/10"
                  >
                    Wissen
                  </button>
                )}
                <button
                  onClick={toggleMinimize}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                >
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area - Only show when not minimized */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`flex max-w-[90%] sm:max-w-[80%] ${
                          message.isBot ? 'flex-row' : 'flex-row-reverse'
                        } items-start space-x-2 sm:space-x-3`}
                      >
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.isBot
                              ? 'bg-gradient-to-br from-[#8F34EA] to-[#2C60EB]'
                              : 'bg-gray-300'
                          }`}
                        >
                          {message.isBot ? (
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                            message.isBot
                              ? 'bg-white border border-gray-200 text-gray-800'
                              : 'bg-gradient-to-br from-[#8F34EA] to-[#2C60EB] text-white'
                          } shadow-sm`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                          <p className={`text-xs mt-1 ${
                            message.isBot ? 'text-gray-500' : 'text-white/70'
                          }`}>
                            {message.timestamp.toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#8F34EA] to-[#2C60EB] flex items-center justify-center">
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-2xl flex-shrink-0">
                  <div className="flex space-x-2 sm:space-x-3 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Stel je vraag over opvoeding of activiteiten..."
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#8F34EA] focus:border-transparent text-sm leading-relaxed"
                        rows="1"
                        style={{ 
                          minHeight: "44px",
                          maxHeight: "120px"
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-br from-[#8F34EA] to-[#2C60EB] text-white p-2.5 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ width: "44px", height: "44px" }}
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2 px-2">
                    Tip: Vraag bijvoorbeeld "Hoe kan ik mijn kind helpen met driftbuien?"
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ParentCoachBot;