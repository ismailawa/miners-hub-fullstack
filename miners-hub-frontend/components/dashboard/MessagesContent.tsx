'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BackendMessage, BackendThread, getChatMessages, getChatThreads, sendMessage } from '../../lib/api/chats';
import {
    isChatSocketConnected,
    joinThread,
    leaveThread,
    onChatMessage,
    onChatThreadUpdate,
    sendSocketMessage,
} from '../../lib/api/chat-socket';
import { hasValidToken } from '../../lib/api/token';

const formatTime = (createdAt?: string) => {
    if (!createdAt) return '';
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(createdAt));
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

const MessagesContent: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    const [threads, setThreads] = useState<BackendThread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<BackendMessage[]>([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeThread = useMemo(
        () => threads.find((thread) => thread.threadId === activeThreadId) || null,
        [activeThreadId, threads],
    );
    const filteredThreads = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return threads;
        return threads.filter((thread) =>
            thread.participant.name.toLowerCase().includes(term)
            || thread.latestMessage?.text?.toLowerCase().includes(term),
        );
    }, [searchTerm, threads]);
    const totalUnread = threads.reduce((total, thread) => total + thread.unreadCount, 0);

    const loadThreads = useCallback(async () => {
        if (!hasValidToken()) {
            setPage('login');
            return;
        }

        setError(null);
        try {
            const nextThreads = await getChatThreads();
            const visibleThreads = nextThreads.filter((thread) => thread.participant.id);
            setThreads(visibleThreads);
            setActiveThreadId((current) => current || visibleThreads[0]?.threadId || null);
        } catch {
            setError('Unable to load conversations.');
        } finally {
            setIsLoadingThreads(false);
        }
    }, [setPage]);

    const loadMessages = useCallback(async (threadId: string) => {
        setIsLoadingMessages(true);
        setError(null);
        try {
            const nextMessages = await getChatMessages(threadId);
            setMessages(nextMessages);
            setThreads((current) =>
                current.map((thread) =>
                    thread.threadId === threadId ? { ...thread, unreadCount: 0 } : thread,
                ),
            );
            window.dispatchEvent(new Event('chat:unread-changed'));
            void loadThreads();
        } catch {
            setMessages([]);
            setError('Unable to load this conversation.');
        } finally {
            setIsLoadingMessages(false);
        }
    }, [loadThreads]);

    useEffect(() => {
        void loadThreads();
    }, [loadThreads]);

    useEffect(() => {
        if (!activeThreadId) {
            setMessages([]);
            return;
        }

        void loadMessages(activeThreadId);
    }, [activeThreadId, loadMessages]);

    useEffect(() => {
        if (!activeThreadId) return;

        void joinThread(activeThreadId).catch(() => undefined);
        return () => {
            void leaveThread(activeThreadId).catch(() => undefined);
        };
    }, [activeThreadId]);

    const upsertMessage = useCallback((message: BackendMessage) => {
        setMessages((current) => {
            if (current.some((existing) => existing.id === message.id)) return current;
            return [...current, message];
        });
        setThreads((current) =>
            current.map((thread) =>
                thread.threadId === message.threadId ? { ...thread, unreadCount: 0, latestMessage: message } : thread,
            ),
        );
        window.dispatchEvent(new Event('chat:unread-changed'));
    }, []);

    const handleSelectThread = (threadId: string) => {
        setActiveThreadId(threadId);
        if (threadId === activeThreadId) {
            void loadMessages(threadId);
        }
    };

    useEffect(() => {
        const offMessage = onChatMessage((message) => {
            if (message.threadId === activeThreadId) {
                upsertMessage(message);
                void loadThreads();
                return;
            }

            void loadThreads();
        });
        const offThreadUpdate = onChatThreadUpdate((payload) => {
            if (payload.threadId === activeThreadId) {
                void loadMessages(payload.threadId);
                return;
            }

            void loadThreads();
        });

        return () => {
            offMessage();
            offThreadUpdate();
        };
    }, [activeThreadId, loadMessages, loadThreads, upsertMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    const replaceOptimisticMessage = (optimisticId: string, saved: BackendMessage) => {
        setMessages((current) => {
            const withoutDuplicate = current.filter((message) => message.id !== saved.id);
            return withoutDuplicate.map((message) => message.id === optimisticId ? saved : message);
        });
    };

    const handleSend = async (event: FormEvent) => {
        event.preventDefault();
        const text = input.trim();
        if (!text || !currentUser || !activeThread || isSending) return;

        if (!hasValidToken()) {
            setPage('login');
            return;
        }

        setInput('');
        setIsSending(true);
        const optimistic: BackendMessage = {
            id: `local-${Date.now()}`,
            threadId: activeThread.threadId,
            senderId: currentUser.id,
            text,
            read: false,
            createdAt: new Date().toISOString(),
            sender: { name: currentUser.name },
        };
        setMessages((current) => [...current, optimistic]);

        try {
            const saved = isChatSocketConnected()
                ? await sendSocketMessage(activeThread.participant.id, text)
                : await sendMessage(activeThread.participant.id, text);
            replaceOptimisticMessage(optimistic.id, saved);
            void loadThreads();
        } catch {
            try {
                const saved = await sendMessage(activeThread.participant.id, text);
                replaceOptimisticMessage(optimistic.id, saved);
                void loadThreads();
            } catch {
                setMessages((current) => current.filter((message) => message.id !== optimistic.id));
                setError('Message failed to send.');
            }
        } finally {
            setIsSending(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] overflow-hidden flex flex-col min-w-0">
            {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr] min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-border bg-secondary text-text-primary shadow-sm">
                <aside className="flex min-h-0 flex-col border-b border-border bg-secondary lg:border-b-0 lg:border-r">
                    <div className="shrink-0 p-6">
                        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>

                        <div className="mt-6 grid grid-cols-2 rounded-full bg-primary p-1">
                            <button
                                type="button"
                                className="rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-content shadow-sm"
                            >
                                General <span className="ml-1 font-medium opacity-80">{threads.length}</span>
                            </button>
                            <button
                                type="button"
                                className="rounded-full px-4 py-3 text-sm font-semibold text-text-secondary"
                            >
                                Unread <span className="ml-1 font-medium text-text-muted">{totalUnread}</span>
                            </button>
                        </div>

                        <label className="mt-7 flex h-14 items-center gap-3 rounded-2xl border border-border px-4 text-text-muted focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search..."
                                className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.1-5.15a6.25 6.25 0 1 1-12.5 0 6.25 6.25 0 0 1 12.5 0z" />
                            </svg>
                        </label>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
                        {isLoadingThreads ? (
                            <div className="p-4 text-sm text-text-secondary">Loading contacts...</div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="p-4 text-sm text-text-secondary">No conversations yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {filteredThreads.map((thread) => {
                                    const isActive = thread.threadId === activeThreadId;
                                    return (
                                        <button
                                            key={thread.threadId}
                                            type="button"
                                            onClick={() => handleSelectThread(thread.threadId)}
                                            className={`w-full rounded-2xl p-4 text-left transition-colors ${isActive ? 'bg-primary' : 'hover:bg-primary/70'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary text-text-secondary">
                                                    {thread.participant.profileImageUrl ? (
                                                        <img src={thread.participant.profileImageUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                                                            {getInitial(thread.participant.name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="truncate text-base font-semibold text-text-primary">{thread.participant.name}</p>
                                                        <span className="shrink-0 text-sm text-text-muted">{formatTime(thread.latestMessage?.createdAt)}</span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <p className="min-w-0 flex-1 truncate text-sm text-text-secondary">
                                                            {thread.latestMessage?.text || 'No messages yet.'}
                                                        </p>
                                                        {thread.unreadCount > 0 ? (
                                                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-accent-content">
                                                                {thread.unreadCount}
                                                            </span>
                                                        ) : (
                                                            <span className="text-accent">✓✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="flex min-h-0 flex-col bg-secondary">
                    {activeThread ? (
                        <>
                            <div className="flex h-[104px] shrink-0 items-center justify-between border-b border-border px-7">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary text-text-secondary">
                                        {activeThread.participant.profileImageUrl ? (
                                            <img src={activeThread.participant.profileImageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                                                {getInitial(activeThread.participant.name)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h2 className="truncate text-lg font-semibold text-text-primary">{activeThread.participant.name}</h2>
                                            <span className="h-2 w-2 rounded-full bg-green-500" />
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                                            <span>Marketplace contact</span>
                                            <span className="rounded-md bg-primary px-2 py-1 font-medium text-text-primary">Direct message</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-text-primary transition-colors hover:bg-border" aria-label="Call contact">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97a1.125 1.125 0 0 0 .417-1.173L6.963 3.102A1.125 1.125 0 0 0 5.872 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                                        </svg>
                                    </button>
                                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-text-primary transition-colors hover:bg-border" aria-label="Conversation options">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm5 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm5 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto bg-secondary px-8 py-7">
                                {isLoadingMessages ? (
                                    <div className="text-center text-sm text-text-secondary">Loading conversation...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-sm text-text-secondary">No messages in this conversation yet.</div>
                                ) : (
                                    <div className="space-y-5">
                                        {messages.map((message) => {
                                            const isMine = message.senderId === currentUser.id;
                                            return (
                                                <div key={message.id} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    {!isMine && (
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary text-text-secondary">
                                                            {activeThread.participant.profileImageUrl ? (
                                                                <img src={activeThread.participant.profileImageUrl} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                                                                    {getInitial(activeThread.participant.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[70%] rounded-2xl px-5 py-4 ${isMine ? 'rounded-br-sm bg-accent text-accent-content' : 'rounded-bl-sm bg-primary text-text-primary'}`}>
                                                        {!isMine && <p className="mb-1 font-semibold">{activeThread.participant.name}</p>}
                                                        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                                                        <p className={`mt-2 text-right text-xs ${isMine ? 'text-accent-content/80' : 'text-text-secondary'}`}>
                                                            {formatTime(message.createdAt)} <span className={isMine ? 'text-accent-content/80' : 'text-accent'}>✓✓</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="shrink-0 bg-secondary px-8 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-16 min-w-0 flex-1 items-center gap-3 rounded-2xl bg-primary px-5">
                                        <button type="button" className="text-text-primary" aria-label="Attach file">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243L8.56 18.31a1.5 1.5 0 0 1-2.121-2.122l9.87-9.87" />
                                            </svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(event) => setInput(event.target.value)}
                                            placeholder="Your message"
                                            disabled={isSending}
                                            className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
                                        />
                                        <button type="button" className="text-text-primary" aria-label="Voice message">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-12 0v1.5a6 6 0 0 0 12 0m-6 6v3m-3 0h6M12 15.75a3 3 0 0 1-3-3V5.25a3 3 0 1 1 6 0v7.5a3 3 0 0 1-3 3Z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSending || !input.trim()}
                                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-content shadow-sm transition-colors hover:bg-yellow-400 disabled:bg-border"
                                        aria-label="Send message"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.52 60.52 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.52 60.52 0 0 0 3.478 2.405Z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-8 text-center text-text-secondary">
                            Select a contact to view messages.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MessagesContent;
