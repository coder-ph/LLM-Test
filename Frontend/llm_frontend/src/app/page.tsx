// your_project_name/frontend/app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { HistoryItem, QueryResponse } from './types'; // We will create this file
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import QueryInput from './components/QueryInput';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
    const [query, setQuery] = useState('');
    const [responses, setResponses] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

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

        fetchHistory(storedUserId);
    }, []);

    const fetchHistory = async (id: string) => {
        if (!id) return;
        try {
            const response = await fetch(`http://localhost:8000/api/v1/history/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            setHistory(data.history.reverse());
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to load query history.');
        }
    };

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userQuery: HistoryItem = {
            query: query,
            ai_response: 'Loading...',
            query_id: '',
            user_id: userId,
            timestamp: new Date().toISOString(),
        };
        const updatedResponses = [...responses, userQuery];
        setResponses(updatedResponses);
        setQuery('');
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/api/v1/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery.query, user_id: userId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'An unknown error occurred.');
            }

            const data: QueryResponse = await res.json();

            const finalResponses = updatedResponses.map((item) =>
                item.query === userQuery.query && item.ai_response === 'Loading...'
                    ? { ...item, ai_response: data.ai_response, query_id: data.query_id }
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

    const handleLoadHistory = (item: HistoryItem) => {
        setResponses([item]);
        setIsHistoryOpen(false);
        scrollToBottom();
    };

    return (
        <div className="font-sans flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <Header onHistoryClick={() => setIsHistoryOpen(true)} />
            <main className="flex-1 overflow-y-auto pt-20 pb-24 sm:pb-32 px-4">
                <ChatWindow
                    responses={responses}
                    error={error}
                    messagesEndRef={messagesEndRef}
                />
            </main>
            <QueryInput
                query={query}
                setQuery={setQuery}
                onSubmit={handleQuerySubmit}
                loading={loading}
            />
            <HistoryPanel
                isHistoryOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onLoadHistory={handleLoadHistory}
            />
            <div
                onClick={() => setIsHistoryOpen(false)}
                className={classNames(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
                    { 'opacity-100 visible': isHistoryOpen, 'opacity-0 invisible': !isHistoryOpen }
                )}
            />
        </div>
    );
}

