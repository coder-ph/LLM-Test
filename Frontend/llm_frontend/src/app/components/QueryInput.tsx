import { Dispatch, SetStateAction } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import classNames from 'classnames';

interface QueryInputProps {
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
}

const QueryInput = ({ query, setQuery, onSubmit, loading }: QueryInputProps) => {
    return (
        <footer className=" bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900/70 backdrop-blur-md border-t dark:border-gray-700 shadow-md transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit(e);
                            }
                        }}
                        className=" ml-30 flex-1 resize-none p-3 border dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300 placeholder-gray-400"
                        placeholder="Ask me anything..."
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className={classNames(
                            'p-3 rounded-full text-white transition-all duration-300 mr-20',
                            {
                                'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500': !loading && query.trim(),
                                'bg-gray-400 dark:bg-gray-600 cursor-not-allowed': loading || !query.trim(),
                            }
                        )}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </form>
            </div>
        </footer>
    );
};

export default QueryInput;