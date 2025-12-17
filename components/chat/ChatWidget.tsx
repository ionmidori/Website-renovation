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

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

    // Event Listener for External Triggers
    useEffect(() => {
        const handleOpenChat = (e: CustomEvent<{ message?: string }>) => {
            setIsOpen(true);
            if (e.detail?.message) {
                // Small delay to ensure UI is ready and feels natural
                setTimeout(() => {
                    sendMessage(e.detail.message);
                }, 500);
            }
        };

        window.addEventListener('OPEN_CHAT_WITH_MESSAGE' as any, handleOpenChat as any);
        return () => window.removeEventListener('OPEN_CHAT_WITH_MESSAGE' as any, handleOpenChat as any);
    }, []);

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

    const [showWelcomeBadge, setShowWelcomeBadge] = useState(false);

    // Initial Welcome Badge Timer
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) {
                setShowWelcomeBadge(true);
            }
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
    }, [isOpen]);

    // Hide badge when chat opens
    useEffect(() => {
        if (isOpen) {
            setShowWelcomeBadge(false);
        }
    }, [isOpen]);

    return (
        <>
            {/* Toggle Button Container */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">

                {/* Welcome Badge / Tooltip */}
                <AnimatePresence>
                    {showWelcomeBadge && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.8 }}
                            className="bg-white text-slate-900 px-4 py-2 rounded-xl shadow-xl shadow-blue-500/10 border border-blue-100 flex items-center gap-3 relative mr-2 cursor-pointer"
                            onClick={() => setIsOpen(true)}
                        >
                            <div className="relative">
                                <ArchitectAvatar className="w-8 h-8" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">SYD AI</span>
                                <span className="text-[11px] text-slate-500 font-medium">Ciao! Posso aiutarti col progetto?</span>
                            </div>

                            {/* Arrow pointing to button */}
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-blue-100"></div>

                            {/* Close badge button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowWelcomeBadge(false);
                                }}
                                className="absolute -top-2 -left-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
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
            </div>


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
                                    <p className="text-xs text-slate-400 flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Online
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            <Sparkles className="w-2 h-2" /> Secure Mode
                                        </span>
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
                                                        props.src ? (
                                                            <div className="group relative mt-2 cursor-pointer overflow-hidden rounded-lg border border-white/10" onClick={() => setSelectedImage(props.src as string)}>
                                                                <img {...props} className="max-w-full h-auto transition-transform hover:scale-105" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1">
                                                                        <Minimize2 className="w-3 h-3 rotate-45" /> Espandi
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : null
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

            {/* LIGHTBOX FOR IMAGE PREVIEW */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                src={selectedImage}
                                alt="Full preview"
                                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/10"
                            />

                            <div className="mt-4 flex gap-4">
                                <Button
                                    onClick={() => setSelectedImage(null)}
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Chiudi
                                </Button>
                                <a
                                    href={selectedImage}
                                    download={`renovation-ai-vision-${Date.now()}.png`}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                                >
                                    <Send className="w-4 h-4 mr-2 rotate-180" /> {/* Simulating download icon */}
                                    Scarica HD
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

}
