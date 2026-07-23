'use client';

import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, getChatMessages, BackendMessage } from '../lib/api/chats';
import { hasValidToken } from '../lib/api/token';
import {
  isChatSocketConnected,
  joinThread,
  leaveThread,
  onChatError,
  onChatMessage,
  sendSocketMessage,
} from '../lib/api/chat-socket';

interface Miner {
  id: string;
  userId?: string;
  name: string;
  imageUrl: string;
}

interface MinerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  miner: Miner | null;
}

const MinerChatModal: React.FC<MinerChatModalProps> = ({ isOpen, onClose, miner }) => {
  const { currentUser, setPage } = useAuth();
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optimisticMessageIdRef = useRef<string | null>(null);

  // Deterministic thread id matches backend lexicographic sort
  const receiverUserId = miner?.userId || miner?.id || null;
  const threadId = React.useMemo(() => {
    if (!currentUser || !receiverUserId) return null;
    return [currentUser.id, receiverUserId].sort().join('--');
  }, [currentUser, receiverUserId]);

  // Load message history whenever the modal opens
  const loadHistory = useCallback(async () => {
    if (!threadId) return;
    setIsLoadingHistory(true);
    try {
      const history = await getChatMessages(threadId);
      setMessages(history);
    } catch {
      // No history yet — that's fine
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (isOpen && miner) loadHistory();
  }, [isOpen, miner, loadHistory]);

  const upsertMessage = useCallback((message: BackendMessage) => {
    setMessages((prev) => {
      if (prev.some((existing) => existing.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const replaceOptimisticMessage = useCallback((optimisticId: string, saved: BackendMessage) => {
    setMessages((prev) => {
      const withoutSavedDuplicate = prev.filter((message) => message.id !== saved.id);
      if (withoutSavedDuplicate.some((message) => message.id === optimisticId)) {
        return withoutSavedDuplicate.map((message) => message.id === optimisticId ? saved : message);
      }
      return [...withoutSavedDuplicate, saved];
    });
  }, []);

  useEffect(() => {
    if (!isOpen || !threadId) return;

    void joinThread(threadId).catch(() => undefined);

    const offMessage = onChatMessage((message) => {
      if (message.threadId !== threadId) return;
      if (message.senderId === currentUser?.id) return;
      upsertMessage(message);
    });
    const offError = onChatError((payload) => {
      console.warn('Chat socket error:', payload.message);
    });

    return () => {
      offMessage();
      offError();
      void leaveThread(threadId).catch(() => undefined);
    };
  }, [currentUser?.id, isOpen, threadId, upsertMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !currentUser || !miner || !receiverUserId)
      return;

    if (!hasValidToken()) {
      onClose();
      setPage('login');
      return;
    }

    const text = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic update
    const optimistic: BackendMessage = {
      id: `local-${Date.now()}`,
      threadId: threadId!,
      senderId: currentUser.id,
      text,
      read: false,
      createdAt: new Date().toISOString(),
      sender: { name: currentUser.name },
    };
    setMessages((prev) => [...prev, optimistic]);
    optimisticMessageIdRef.current = optimistic.id;

    try {
      const saved = isChatSocketConnected()
        ? await sendSocketMessage(receiverUserId, text)
        : await sendMessage(receiverUserId, text);
      replaceOptimisticMessage(optimistic.id, saved);
    } catch {
      try {
        const saved = await sendMessage(receiverUserId, text);
        replaceOptimisticMessage(optimistic.id, saved);
      } catch {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        alert('Failed to send message. Please try again.');
      }
    } finally {
      if (optimisticMessageIdRef.current === optimistic.id) {
        optimisticMessageIdRef.current = null;
      }
      setIsSending(false);
    }
  };

  if (!isOpen || !miner) return null;

  const MinerAvatar: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) =>
    miner.imageUrl ? (
      <img src={miner.imageUrl} alt={miner.name} className={`${className} rounded-full object-cover`} />
    ) : (
      <div className={`${className} rounded-full bg-primary flex items-center justify-center font-bold text-accent`}>
        {miner.name.charAt(0)}
      </div>
    );

  return (
    <div
      className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.25s ease-out' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-[80vh] max-h-[700px] bg-secondary rounded-lg shadow-2xl border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <MinerAvatar />
            <div>
              <h3 className="font-bold text-text-primary">{miner.name}</h3>
              <p className="text-xs text-text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 bg-text-muted rounded-full" />
                Direct message
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoadingHistory && (
            <div className="text-center text-text-muted text-sm py-8">Loading messages…</div>
          )}
          {!isLoadingHistory && messages.length === 0 && (
            <div className="text-center text-text-muted text-sm py-8">
              No messages yet. Say hello to {miner.name}!
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.senderId !== currentUser?.id && (
                <div className="flex-shrink-0 self-end">
                  <MinerAvatar className="w-8 h-8" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  msg.senderId === currentUser?.id
                    ? 'bg-accent text-accent-content rounded-br-none'
                    : 'bg-primary text-text-secondary rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 opacity-70 ${msg.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-end gap-2 justify-end">
              <div className="p-3 rounded-xl bg-accent/40 rounded-br-none">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-accent-content rounded-full animate-pulse [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-accent-content rounded-full animate-pulse [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-accent-content rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-border">
          <div className="flex items-center bg-primary rounded-lg border border-border focus-within:ring-2 focus-within:ring-accent">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${miner.name}…`}
              disabled={isSending}
              className="w-full bg-transparent p-2.5 text-text-primary placeholder-text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2.5 text-accent disabled:text-text-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default MinerChatModal;
