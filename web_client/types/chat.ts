/**
 * Chat-related TypeScript interfaces
 * Provides type safety for chatbot components
 */

/**
 * 2D position coordinates
 */
export interface ChatButtonPosition {
    x: number;
    y: number;
}

/**
 * Drag boundary constraints to keep button within viewport
 */
export interface DragConstraints {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

/**
 * Props for ChatToggleButton component
 */
export interface ChatToggleButtonProps {
    /** Whether the chat is currently open */
    isOpen: boolean;
    /** Callback when button is clicked (not dragged) */
    onClick: () => void;
    /** Current position of the button */
    position: ChatButtonPosition;
    /** Drag boundary constraints */
    constraints: DragConstraints;
    /** Whether the button is currently being dragged */
    isDragging: boolean;
    /** Callback when drag starts */
    onDragStart: () => void;
    /** Callback when drag ends */
    onDragEnd: (event: any, info: any) => void;
}

/**
 * Return type for useDraggableButton hook
 */
export interface UseDraggableButtonReturn {
    /** Current button position */
    position: ChatButtonPosition;
    /** Current drag constraints */
    constraints: DragConstraints;
    /** Whether currently dragging */
    isDragging: boolean;
    /** Drag start handler */
    handleDragStart: () => void;
    /** Drag end handler */
    handleDragEnd: (event: any, info: any) => void;
}
