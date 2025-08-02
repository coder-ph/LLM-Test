
import { X } from 'lucide-react';
import classNames from 'classnames';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
    isHistoryOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onLoadHistory: (item: HistoryItem) => void;
}

const HistoryPanel = ({ isHistoryOpen, onClose, history, onLoadHistory }: HistoryPanelProps) => {
    return (
        <div
            className={classNames(
                'fixed top-0 left-0 h-full bg-white dark:bg-gray-900 w-full md:w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
                { 'translate-x-0': isHistoryOpen, '-translate-x-full': !isHistoryOpen }
            )}
        >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold">Query History</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div
                                key={item.query_id}
                                onClick={() => onLoadHistory(item)}
                                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <p className="font-semibold text-sm truncate">{item.query}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(item.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center mt-8">No history found.</p>
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;
