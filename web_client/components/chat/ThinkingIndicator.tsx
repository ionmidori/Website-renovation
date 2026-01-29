import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
    message?: string;
}

export const ThinkingIndicator = ({ message }: ThinkingIndicatorProps) => {
    // Default text if message is undefined OR empty string
    const displayMessage = message && message.trim().length > 0 ? message : "Elaborazione...";

    console.log('[ThinkingIndicator] Render:', { message, displayMessage });

    return (
        <div className="flex items-center gap-3 min-h-[24px]">
            <div className="flex gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.span
                        key={i}
                        className="w-2 h-2 bg-luxury-teal rounded-full"
                        animate={{
                            y: [0, -6, 0],
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.5, 1],
                            delay
                        }}
                    />
                ))}
            </div>
            <motion.span
                key={displayMessage} // Trigger animation on text change
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-luxury-text/60 font-medium animate-pulse"
            >
                {displayMessage}
            </motion.span>
        </div>
    );
};
