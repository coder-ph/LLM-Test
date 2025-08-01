import { RefObject } from "react";
import {ChevronRight} from 'lucide-react';
import ResponseRender from './ResponseRenderer';
import {HistoryItem} from '../types';

interface ChatWindowProps {
    responses: HistoryItem[];
    error: string | null;
    messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatWindow = ({responses, error, messagesEndRef}: ChatWindowProps) => {
    return(
        <div className="container mx-auto mx-w=3x1 flex flex-col space-y-6">
            {responses.length===0 &&(
                <div className="flex flex-col items-center justify-center h-[calc(100vh-160vh)]">
                    <ChevronRight className='w-12 h-12 text-gray-400 dark:text-gray-600 animate-pulse' />
                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
                        Start by asking a question ...
                    </p>
                    </div>
            )}

            {responses.map((res, index)=>(
                <div key={index} className="flex flex-col gap-2">
                    <div className="bg-blue-500 text-white rounded-t-x1 rounded-b1-x1 p-4 self-end max-w-[90%] md:max-w-[75%] shadow-md">
                        <p className="font-medium"> {res.query}</p>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-b-x1 rounded-tr-x1 p-4 self-start max-w-[90%] md:max-w-[75%] shadow-lg">
                        <ResponseRender content={res.ai_response} />
                    </div>
                </div>
            ))}
            {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-x1 p-4 max-w-[90%] md:max-w-[75%] self-start shadow-lg">
                    <p className="font-bold">
                        Error:
                    </p>
                    <p>{error}</p>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )
};
export default ChatWindow