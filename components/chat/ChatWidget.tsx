'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Paperclip, Loader2, Minimize2, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import ArchitectAvatar from '@/components/ArchitectAvatar';
import { cn } from '@/lib/utils';

// Types
type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Ciao! Sono **SYD**, il tuo Architetto AI.\n\nPosso aiutarti a:\n1. 📐 **Creare un Preventivo** dettagliato.\n2. 🎨 **Visualizzare un Rendering** 3D della tua idea.\n\nDa dove iniziamo?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Handle Image Selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSelectedImages((prev) => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle Voice Input
    const handleVoiceRecorded = async (file: File) => {
        setIsLoading(true);
        // Add temporary user message
        const tempUserMsg: Message = { role: 'user', content: "🎤 (Messaggio Vocale inviato)" };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [...messages, tempUserMsg].map(m => ({ role: m.role, content: m.content })),
                            images: [base64Audio]
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) throw new Error(data.error || "Errore API");

                    const botMsg: Message = { role: 'assistant', content: data.response };
                    setMessages((prev) => [...prev, botMsg]);

                } catch (error) {
                    console.error(error);
                    setMessages((prev) => [...prev, { role: 'assistant', content: "⚠️ Errore nell'elaborazione del vocale." }]);
                } finally {
                    setIsLoading(false);
                }
            };
        } catch (error) {
            console.error("Voice Error", error);
            setIsLoading(false);
        }
    };

    // Core Send Logic
    const sendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if ((!textToSend.trim() && selectedImages.length === 0) || isLoading) return;

        const newMsg: Message = { role: 'user', content: textToSend };
        setMessages((prev) => [...prev, newMsg]);
        setInput('');
        setIsLoading(true);

        // Prepare payload with images if any
        const payloadImages = [...selectedImages];
        setSelectedImages([]); // Clear after sending

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, newMsg].map(m => ({ role: m.role, content: m.content })), // Send history
                    images: payloadImages.length > 0 ? payloadImages : undefined
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Errore API");

            const botMsg: Message = { role: 'assistant', content: data.response };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: 'assistant', content: "⚠️ Mi dispiace, si è verificato un errore tecnico. Riprova più tardi." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "w-16 h-16 rounded-full shadow-2xl transition-all duration-300 relative border border-white/10",
                        isOpen ? "bg-slate-800 text-white" : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-110"
                    )}
                >
                    {isOpen ? <X className="w-8 h-8" /> : (
                        <>
                            <MessageSquare className="w-8 h-8 text-white" />
                            {/* Notification Dot */}
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-4 md:right-6 w-[95vw] md:w-[450px] max-h-[80vh] h-[700px] bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <ArchitectAvatar />
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        SYD <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">AI ARCHITECT</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <Minimize2 className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3 max-w-[90%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
                                        msg.role === 'user'
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-slate-800 border-slate-700 text-blue-400"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </div>

                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                                    )}>
                                        <div className="prose prose-invert prose-p:my-1 prose-pre:bg-slate-900 prose-pre:p-2 prose-pre:rounded-lg max-w-none break-words">
                                            <ReactMarkdown
                                                urlTransform={(value) => value}
                                                components={{
                                                    img: ({ node, ...props }) => (
                                                        props.src ? <img {...props} className="rounded-lg max-w-full h-auto mt-2 border border-white/10" /> : null
                                                    )
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border-slate-700 border flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-md">

                            {/* Image Previews */}
                            {selectedImages.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    {selectedImages.map((img, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 group">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />

                                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex items-center p-1 focus-within:border-blue-500/50 transition-colors">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Descrivi cosa vuoi ristrutturare..."
                                        className="w-full bg-transparent text-white text-sm px-3 py-2 max-h-24 min-h-[44px] focus:outline-none resize-none scrollbar-hide"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <div className="flex items-center gap-1 pr-1">
                                        <VoiceRecorder onRecordingComplete={handleVoiceRecorded} disabled={isLoading} />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => sendMessage()}
                                    disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                                    className={cn(
                                        "rounded-full w-12 h-12 shrink-0 transition-all",
                                        input.trim() || selectedImages.length > 0
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-slate-800 text-slate-500"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
