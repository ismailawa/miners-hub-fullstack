import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../lib/types';

interface Miner {
    id: string;
    name: string;
    imageUrl: string;
}

interface MinerChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    miner: Miner | null;
}

const MinerChatModal: React.FC<MinerChatModalProps> = ({ isOpen, onClose, miner }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatKey = React.useMemo(() => {
        if (!currentUser || !miner) return null;
        return `miners_hub_chat_${[currentUser.id, miner.id].sort().join('_')}`;
    }, [currentUser, miner]);

    useEffect(() => {
        if (isOpen && chatKey) {
            try {
                const storedMessages = localStorage.getItem(chatKey);
                if (storedMessages) {
                    setMessages(JSON.parse(storedMessages));
                } else {
                    setMessages([]); // Start with an empty chat
                }
            } catch (error) {
                console.error("Failed to load chat from localStorage", error);
                setMessages([]);
            }
        }
    }, [isOpen, chatKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const generateMinerResponse = async (userMessage: string) => {
        if (!miner || !currentUser || !chatKey) return;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are ${miner.name}, a professional and helpful miner. A potential customer named ${currentUser.name} has a question for you.
            
            Customer's message: "${userMessage}"
            
            Please provide a concise, friendly, and professional response. Keep it to 2-3 sentences. Do not mention that you are an AI.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const now = new Date().toISOString();
            const minerMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                chatThreadId: chatKey,
                senderId: miner.id,
                senderName: miner.name,
                text: response.text || '',
                timestamp: now,
                createdAt: now,
            };

            setMessages(prev => {
                const newMessages = [...prev, minerMessage];
                if (chatKey) {
                    localStorage.setItem(chatKey, JSON.stringify(newMessages));
                }
                return newMessages;
            });

        } catch (err) {
            console.error("Gemini API error in miner chat:", err);
            const now = new Date().toISOString();
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                chatThreadId: chatKey,
                senderId: miner.id,
                senderName: miner.name,
                text: "Sorry, I'm currently unable to respond. Please try again later.",
                timestamp: now,
                createdAt: now,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !currentUser || !chatKey) return;

        const now = new Date().toISOString();
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            chatThreadId: chatKey,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: input,
            timestamp: now,
            createdAt: now,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        localStorage.setItem(chatKey, JSON.stringify(newMessages));

        const messageToSend = input;
        setInput('');
        setIsLoading(true);

        // Simulate a small delay before AI responds
        setTimeout(() => generateMinerResponse(messageToSend), 1000);
    };

    if (!isOpen || !miner) return null;

    const MinerAvatar: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
        miner.imageUrl ? <img src={miner.imageUrl} alt={miner.name} className={`${className} rounded-full object-cover`} /> : <div className={`${className} rounded-full bg-primary flex items-center justify-center font-bold text-accent`}>{miner.name.charAt(0)}</div>
    );

    return (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-lg h-[80vh] max-h-[700px] bg-secondary rounded-lg shadow-2xl border border-border flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <MinerAvatar />
                        <div>
                            <h3 className="font-bold text-text-primary">{miner.name}</h3>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            {msg.senderId !== currentUser?.id && <div className="flex-shrink-0 self-end"><MinerAvatar className="w-8 h-8" /></div>}
                            <div className={`max-w-[80%] p-3 rounded-xl ${msg.senderId === currentUser?.id ? 'bg-accent text-accent-content rounded-br-none' : 'bg-primary text-text-secondary rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="flex-shrink-0 self-end"><MinerAvatar className="w-8 h-8" /></div>
                            <div className="p-3 rounded-xl bg-primary">
                                <div className="flex space-x-1">
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-text-muted rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-border">
                    <div className="flex items-center bg-primary rounded-lg border border-border focus-within:ring-2 focus-within:ring-accent">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${miner.name}...`} disabled={isLoading} className="w-full bg-transparent p-2.5 text-text-primary placeholder-text-muted focus:outline-none" />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2.5 text-accent disabled:text-text-muted transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default MinerChatModal;