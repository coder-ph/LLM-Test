import { History } from 'lucide-react';

interface HeaderProps {
    onHistoryClick: () => void;
}

const Header = ({ onHistoryClick }: HeaderProps) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b dark:border-gray-700 shadow-sm transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">AI Q&A</h1>
                <button
                    onClick={onHistoryClick}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Open history"
                >
                    <History className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;