
export interface StyleOption {
    id: string;
    name: string;
    img: string;
    description: string;
}

export type MessageType = 'text' | 'image' | 'system';

export interface ChatMessageData {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data'; // Vercel AI SDK roles
    content: string;
    timestamp?: number;
    // UI specific extensions
    uiType?: MessageType;
    attachmentUrl?: string;
}

// Strictly Typed State Machine
export type ChatStep =
    | 'IDLE'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'ERROR';     
