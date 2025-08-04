// your_project_name/frontend/app/page.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { HistoryItem, QueryResponse } from './types'; 
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import QueryInput from './components/QueryInput';
import HistoryPanel from './components/HistoryPanel';
import './globals.css';


interface Conversation {
    id: string;
    items: HistoryItem[];
    title: string;
}


export default function App() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [query, setQuery] = useState('');
    const [responses, setResponses] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [responses]);

    useEffect(() => {
        let storedUserId = localStorage.getItem('llm_user_id');
        if (!storedUserId) {
            storedUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('llm_user_id', storedUserId);
        }
        setUserId(storedUserId);
    }, []);

    const fetchHistory = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const response = await fetch(`${API_URL}/api/v1/history/${id}`);
            console.log("response",response)
            
            if (!response.ok) {
                
                throw new Error('Failed to fetch history');
                
            }
            const data: { history: HistoryItem[] } = await response.json();
            
            
            const groupedHistory: { [key: string]: HistoryItem[] } = {};
            data.history.forEach(item => {
                const sessionId = item.session_id;
                if (!groupedHistory[sessionId]) {
                    groupedHistory[sessionId] = [];
                }
                groupedHistory[sessionId].push(item);
            });

            
            const newConversations = Object.entries(groupedHistory).map(([id, items]) => {
                
                const sortedItems = items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstQuery = sortedItems[0]?.query || 'New Chat';
                return {
                    id,
                    items: sortedItems,
                    title: firstQuery.length > 50 ? `${firstQuery.substring(0, 50)}...` : firstQuery,
                };
            });
            
            setHistory(newConversations);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to load query history.');
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchHistory(userId);
        }
    }, [userId, fetchHistory]);

    const startNewChat = () => {
        setResponses([]);
        setCurrentConversationId(null);
        setIsHistoryOpen(false);
    };

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userQuery: HistoryItem = {
            query: query,
            ai_response: 'Loading...',
            session_id: currentConversationId || '',
            user_id: userId,
            timestamp: new Date().toISOString(),
        };
        const updatedResponses = [...responses, userQuery];
        setResponses(updatedResponses);
        setQuery('');
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/v1/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery.query, user_id: userId, session_id: userQuery.session_id }),
            });
            console.log(res)
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'An unknown error occurred.');
            }

            const data: QueryResponse = await res.json();
            
            
            if (!currentConversationId) {
                setCurrentConversationId(data.session_id);
            }

            const finalResponses = updatedResponses.map((item) =>
                item.query === userQuery.query && item.ai_response === 'Loading...'
                    ? { ...item, ai_response: data.ai_response, session_id: data.session_id }
                    : item
            );
            setResponses(finalResponses);
            fetchHistory(userId);
        } catch (err: any) {
            setError(err.message || 'Failed to get a response from the AI.');
            setResponses(responses.slice(0, responses.length));
        } finally {
            setLoading(false);
        }
    };

    const handleLoadHistory = (conversation: Conversation) => {
        setResponses(conversation.items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        setCurrentConversationId(conversation.id);
        setIsHistoryOpen(false);
    };

    return (
        <div className="font-sans flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <Header onHistoryClick={() => setIsHistoryOpen(true)} onNewChatClick={startNewChat} isHistoryOpen={isHistoryOpen} />
            <div className={classNames('flex-1 overflow-y-auto pt-20 pb-24 sm:pb-32 px-4 transition-all duration-300', { 'md:ml-20 md:pl-0': !isHistoryOpen, 'md:pl-80': isHistoryOpen })}>
                <main className="container mx-auto max-w-3xl flex flex-col">
                    <ChatWindow
                        responses={responses}
                        error={error}
                        messagesEndRef={messagesEndRef}
                    />
                </main>
            </div>
            <QueryInput
                query={query}
                setQuery={setQuery}
                onSubmit={handleQuerySubmit}
                loading={loading}
            />
            <HistoryPanel
                isHistoryOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onOpen={() => setIsHistoryOpen(true)}
                history={history}
                onLoadHistory={handleLoadHistory}
                onNewChat={startNewChat}
            />
            <div
                onClick={() => setIsHistoryOpen(false)}
                className={classNames(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden',
                    { 'opacity-100 visible': isHistoryOpen, 'opacity-0 invisible': !isHistoryOpen }
                )}
            />
        </div>
    );
}
