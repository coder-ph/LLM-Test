
import { X, Plus, Menu } from 'lucide-react';
import classNames from 'classnames';
import { HistoryItem } from '../types';
import { Fragment } from 'react';

interface Conversation {
    id: string;
    items: HistoryItem[];
    title: string;
}

interface HistoryPanelProps {
    isHistoryOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    history: Conversation[];
    onLoadHistory: (conversation: Conversation) => void;
    onNewChat: () => void;
}

const HistoryPanel = ({ isHistoryOpen, onClose, onOpen, history, onLoadHistory, onNewChat }: HistoryPanelProps) => {
    return (
        <Fragment>
            
            <div className={classNames(
                'fixed top-0 left-0 h-full w-20 bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow-xl z-50 transform transition-transform duration-300 ease-in-out hidden md:flex flex-col items-center py-4',
                { '-translate-x-full': isHistoryOpen }
            )}>
                <button
                    onClick={onOpen}
                    className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Open history"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 mt-8">
                    <button
                        onClick={onNewChat}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="New chat"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            
            <div
                className={classNames(
                    'fixed top-0 left-0 h-full bg-white dark:bg-gray-900 w-full md:w-80 border-r dark:border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
                    { 'translate-x-0': isHistoryOpen, '-translate-x-full': !isHistoryOpen }
                )}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Query History</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onNewChat}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="New chat"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                    {history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => onLoadHistory(conversation)}
                                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <p className="font-semibold text-sm truncate">{conversation.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(conversation.items[0]?.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center mt-8">No history found.</p>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            <div
                onClick={onClose}
                className={classNames(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden',
                    { 'opacity-100 visible': isHistoryOpen, 'opacity-0 invisible': !isHistoryOpen }
                )}
            />
        </Fragment>
    );
};

export default HistoryPanel;
