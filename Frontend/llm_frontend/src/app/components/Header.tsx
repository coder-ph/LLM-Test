// your_project_name/frontend/app/components/Header.tsx
import { History, Plus, Menu } from 'lucide-react';
import classNames from 'classnames';

interface HeaderProps {
    onHistoryClick: () => void;
    onNewChatClick: () => void;
    isHistoryOpen: boolean;
}

const Header = ({ onHistoryClick, onNewChatClick, isHistoryOpen }: HeaderProps) => {
    return (
        <header className={classNames(
            "fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b dark:border-gray-700 shadow-sm transition-colors duration-300",
            { 'md:left-80': isHistoryOpen }
        )}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onHistoryClick}
                        className={classNames(
                            "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden",
                            { 'hidden': isHistoryOpen }
                        )}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">AI Q&A</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNewChatClick}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
                        aria-label="New chat"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onHistoryClick}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:block"
                        aria-label="Open history"
                    >
                        <History className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
