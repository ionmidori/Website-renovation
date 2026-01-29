/**
 * Chat types for SYD Renovation
 * Fully compatible with Vercel AI SDK Data Protocol
 */

export interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    state: 'call' | 'result';
    args: any;
    result?: any;
}

export interface Attachment {
    id: string;
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    status: 'idle' | 'uploading' | 'compressing' | 'done' | 'error';
    progress: number;
    publicUrl?: string; // Firebase URL
    trimRange?: {
        start: number;
        end: number;
    };
    fileUri?: string; // File API URI (for videos)
}

export interface Message {
    id: string;
    role: 'system' | 'user' | 'assistant' | 'data' | 'tool';
    content: string;
    createdAt?: Date;
    toolInvocations?: ToolInvocation[];
    /**
     * UI-specific attachments (images/videos)
     * These are optimistic updates, the actual data is sent via body
     */
    /**
     * Vercel AI SDK Data Protocol Parts (Text/Image/Tool)
     */
    parts?: Array<{
        type: 'text' | 'image' | 'tool-invocation' | 'reasoning';
        text?: string;
        image?: string;
        toolInvocation?: ToolInvocation;
    }>;
    attachments?: {
        images?: string[];
        videos?: string[];
    };
}

/**
 * UI State Types
 */
export interface ChatButtonPosition {
    x: number;
    y: number;
}

export interface DragConstraints {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export interface UseDraggableButtonReturn {
    position: ChatButtonPosition;
    constraints: DragConstraints;
    isDragging: boolean;
    handleDragStart: () => void;
    handleDragEnd: (event: any, info: any) => void;
}
