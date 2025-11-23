import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat, GenerateContentResponse } from '@google/genai';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    "Tell me about Kalky Interior",
    "What services does Kitzine offer?",
    "How can Kalky Digital help my business?",
    "Construction services by Kalky Infra"
  ];

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = createChatSession();
    
    // Add initial greeting with specific ecosystem info
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Welcome to Kalky Digital. I am your specialized AI assistant.

I can help you with information regarding our ecosystem:
• Kalky Interior (Interior Design)
• Kitzine (Modular Kitchens, Furniture & Lighting)
• Kalky Digital (Website, App Dev & Marketing)
• Kalky Infra (Construction & Real Estate)

How may I assist you today?`,
        isStreaming: false
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || !chatSessionRef.current || isLoading) return;

    const userMessageText = text.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      text: userMessageText,
    }]);

    try {
      // Add placeholder for model response
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        isStreaming: true
      }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userMessageText });
      
      let fullText = '';
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          // Use functional update to ensure we are updating the correct message in the list
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I apologize, but I encountered an error connecting to the service. Please try again.",
        isStreaming: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full flex flex-col items-center h-[calc(100vh-8rem)] animate-fade-in relative z-10">
      
      {/* Messages Area */}
      <div className="w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] sm:max-w-[75%] px-5 py-3.5 text-lg leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-[#000044] text-white rounded-2xl rounded-tr-sm' 
                  : 'glass-panel bg-white/70 text-slate-800 rounded-2xl rounded-tl-sm border border-white/60'}
              `}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.isStreaming && (
                 <span className="inline-block w-2 h-4 ml-1 bg-blue-500/50 animate-pulse align-middle rounded-sm"></span>
              )}
            </div>
          </div>
        ))}
        {isLoading && !messages.some(m => m.isStreaming) && (
            <div className="flex justify-start w-full animate-fade-in">
                 <div className="bg-white/50 px-4 py-2 rounded-full flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions (Only show when chat is empty or just started) */}
      {messages.length < 3 && !isLoading && (
        <div className="w-full max-w-3xl px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-white/40 border border-white/50 text-xs font-medium text-[#000044] hover:bg-white hover:shadow-md transition-all backdrop-blur-sm"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="w-full max-w-3xl px-4 py-6">
        <div className={`glass-panel p-2 rounded-[2rem] shadow-2xl shadow-blue-900/10 flex items-center gap-2 pr-2 pl-6 ring-1 ring-white/50 hover:ring-blue-200/50 transition-all ${isLoading ? 'opacity-80' : ''}`}>
            <input
                type="text"
                className="flex-grow bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none text-lg py-3"
                placeholder="Ask about Interiors, Infra, or Digital..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
            />
            <Button 
                variant="primary" 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 !p-0 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </Button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3 font-medium tracking-wide">
          Kalky GPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};