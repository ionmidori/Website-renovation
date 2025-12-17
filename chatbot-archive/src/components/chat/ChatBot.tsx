
'use client';

import React, { useRef, useEffect } from 'react';
import { MessageCircle, Paperclip, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatLogic } from '@/hooks/useChatLogic';
import { ChatHeader, MessageBubble } from './ChatComponents';

// Static Data

const ChatBot: React.FC = () => {
    const {
        isOpen, setIsOpen, messages, input, handleInputChange,
        handleSubmit, handleFileUpload, handleStyleSelect, step
    } = useChatLogic();

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-5 z-50 w-[90%] md:w-[400px] h-[600px] max-h-[85vh] bg-cream rounded-2xl shadow-2xl flex flex-col border border-earth-light/50 overflow-hidden"
                    >
                        <ChatHeader onClose={() => setIsOpen(false)} />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-cream scrollbar-thin">
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg as any} />
                            ))}

                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="bg-white border-t border-gray-100 input-container footer-bar">
                            {/* Hidden File Input */}
                            <input
                                key="file-input"
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                }}
                            />

                            {/* Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-sage-DEFAULT hover:bg-sage-light/10 rounded-xl transition flex-shrink-0"
                                title="Carica immagine stanza"
                            >
                                <Paperclip size={20} />
                            </button>

                            {/* Text Input */}
                            <input
                                key="text-input"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Scrivi un messaggio..."
                                className="bg-gray-50 border-none focus:ring-2 focus:ring-sage-light rounded-xl px-4 py-3 text-sm text-dark-DEFAULT text-input"
                            />

                            {/* Send Button */}
                            <button
                                type="submit"
                                className="bg-sage-DEFAULT text-white rounded-xl hover:bg-sage-dark transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed send-button"
                                disabled={!input.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 z-50 bg-sage-DEFAULT text-white p-4 rounded-full shadow-xl hover:bg-sage-dark transition flex items-center gap-3"
                >
                    <MessageCircle size={24} />
                    <span className="font-bold pr-1">Consulenza AI</span>
                </motion.button>
            )}
        </>
    );
};

export default ChatBot;
