import { RefObject } from "react";
import {ChevronRight} from 'lucide-react';
import ResponseRender from './responseRenderer';
import {HistoryItem} from '..types';

interface ChatWindowProps {
    responses: HistoryItem[];
    error: string | null;
    messagesEndRef: RefObject<HTMLDivElement>;
}