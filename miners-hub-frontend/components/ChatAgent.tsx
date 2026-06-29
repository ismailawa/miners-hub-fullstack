'use client';

import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { chatWithJatau } from '../lib/api/ai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const WELCOME: Message = {
  role: 'model',
  text: "Hello! I'm Jatau, your dedicated Mining Officer here at Miners Hub. Whether you have questions about mineral trading, licensing, safety, or market trends in Nigeria, I'm here to help. What's on your mind today?",
};

const ChatAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const { response } = await chatWithJatau({ message: userText });
      setMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "I seem to be having some trouble connecting. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const AgentAvatar = () => (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center ring-2 ring-accent flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[calc(100vw-3rem)] max-w-md h-[70vh] max-h-[600px] bg-secondary rounded-lg shadow-2xl border border-border flex flex-col"
          style={{ animation: 'slideIn 0.3s ease-out' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center space-x-3">
              <AgentAvatar />
              <div>
                <h3 className="font-bold text-text-primary">Jatau — Mining Officer</h3>
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <AgentAvatar />}
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-accent-content rounded-br-none'
                      : 'bg-primary text-text-secondary rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <AgentAvatar />
                <div className="p-3 rounded-xl bg-primary">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border flex-shrink-0">
            <div className="flex items-center bg-primary rounded-lg border border-border focus-within:ring-2 focus-within:ring-accent">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Jatau anything about mining…"
                disabled={isLoading}
                className="w-full bg-transparent p-2.5 text-text-primary placeholder-text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 text-accent disabled:text-text-muted transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-accent rounded-full shadow-2xl flex items-center justify-center text-accent-content hover:scale-110 transition-transform animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.948 8.948 0 01-3.712-.766L2.35 18.283a1 1 0 01-1.195-1.195l.983-3.935A8.968 8.968 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Open Chat with Jatau</span>
          </button>
          <div className="absolute bottom-1/2 translate-y-1/2 right-full mr-4 px-3 py-1.5 bg-secondary text-text-primary text-sm font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with Jatau
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn { from { transform: translateY(10px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ChatAgent;