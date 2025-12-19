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
        { role: 'assistant', content: "Posso aiutarti a:\n1. 📐 **Creare un Preventivo** dettagliato.\n2. 🎨 **Visualizzare un Rendering** 3D della tua idea.\n\nDa dove iniziamo?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [typingMessage, setTypingMessage] = useState('SYD sta pensando...');

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [viewportHeight, setViewportHeight] = useState<number | null>(null);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    // Contextual typing messages - optimized
    useEffect(() => {
        if (!isLoading) {
            setTypingMessage('Sto pensando...'); // Reset
            return;
        }

        const typingMessages = [
            'Sto analizzando...',
            'Sto elaborando la risposta...',
            'Sto consultando gli archivi...',
            'Quasi pronto...'
        ];

        let index = 0;
        setTypingMessage(typingMessages[0]);

        const interval = setInterval(() => {
            index = (index + 1) % typingMessages.length;
            setTypingMessage(typingMessages[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Auto-scroll logic - universale per mobile e desktop
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        // Fallback con scrollIntoView
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    };

    useEffect(() => {
        // Scroll quando cambiano i messaggi o si apre la chat
        if (messages.length !== prevMessagesLengthRef.current || isOpen) {
            // Usa instant scroll all'apertura per UX migliore
            scrollToBottom(isOpen && prevMessagesLengthRef.current === messages.length ? 'instant' : 'smooth');
            prevMessagesLengthRef.current = messages.length;
        }
    }, [messages.length, isOpen]);

    // Scroll anche quando finisce il loading
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            setTimeout(() => scrollToBottom('smooth'), 100);
        }
    }, [isLoading]);

    /**
     * Compresses and resizes images client-side before upload.
     * @param file - Original file selected by user
     * @returns Compressed blob ready for Gemini API
     */
    const compressImageForGemini = async (file: File): Promise<Blob> => {
        const maxWidth = 2048;
        const quality = 0.8;
        const mimeType = 'image/jpeg';

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    }, mimeType, quality);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Handle Image Selection with Compression (Non-blocking)
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Create temporary placeholder immediately (non-blocking)
            const tempId = `temp-${Date.now()}`;
            const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5NGE3YjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db21wcmltZW5kby4uLjwvdGV4dD48L3N2Zz4=';

            // Add placeholder and get its index
            let placeholderIndex: number;
            setSelectedImages((prev) => {
                placeholderIndex = prev.length; // Store the index where the placeholder will be
                return [...prev, placeholderImage];
            });

            // Compress in background (async, non-blocking)
            try {
                const compressedBlob = await compressImageForGemini(file);

                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    // Replace placeholder with compressed image
                    setSelectedImages((prev) => {
                        const updated = [...prev];
                        if (placeholderIndex < updated.length) { // Ensure index is valid
                            updated[placeholderIndex] = base64;
                        }
                        return updated;
                    });
                };
                reader.readAsDataURL(compressedBlob);
            } catch (error) {
                console.error('Image compression error:', error);
                // Fallback: load original
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setSelectedImages((prev) => {
                        const updated = [...prev];
                        if (placeholderIndex < updated.length) { // Ensure index is valid
                            updated[placeholderIndex] = base64;
                        }
                        return updated;
                    });
                };
                reader.readAsDataURL(file);
            }
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

    // Typewriter effect & Auto-close logic
    const [typewriterText, setTypewriterText] = useState('');
    const fullMessage = "Ciao, sono SYD! Posso aiutarti con il tuo progetto?";

    useEffect(() => {
        if (!showWelcomeBadge || isOpen) {
            setTypewriterText('');
            return;
        }

        let currentIndex = 0;
        let closeTimer: NodeJS.Timeout;

        const typeInterval = setInterval(() => {
            if (currentIndex < fullMessage.length) {
                setTypewriterText(fullMessage.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(typeInterval);
                // Start auto-close timer after typing finishes (e.g., 5 seconds read time)
                closeTimer = setTimeout(() => {
                    setShowWelcomeBadge(false);
                }, 5000);
            }
        }, 50); // 50ms per character (slightly faster for responsiveness)

        return () => {
            clearInterval(typeInterval);
            clearTimeout(closeTimer);
        };
    }, [showWelcomeBadge, isOpen]);

    // Visual Viewport Logic (Mobile Only)
    useEffect(() => {
        if (!isOpen) return;

        const handleResize = () => {
            // Only apply on mobile where we want full screen
            if (window.visualViewport && window.innerWidth < 768) {
                setViewportHeight(window.visualViewport.height);
            } else {
                setViewportHeight(null);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            window.visualViewport.addEventListener('scroll', handleResize); // Handle scroll too
            handleResize(); // Initial set
        }

        window.addEventListener('resize', handleResize); // Fallback

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
                window.visualViewport.removeEventListener('scroll', handleResize);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    // Scroll to bottom when keyboard opens (viewport height changes)
    useEffect(() => {
        if (isOpen && viewportHeight) {
            // Small delay to allow layout update
            setTimeout(() => scrollToBottom('smooth'), 100);
        }
    }, [viewportHeight, isOpen]);

    // Strict Body Scroll Lock & Bounce Prevention
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        if (isOpen) {
            // Store current scroll to maybe restore it (optional, but good UX)
            // For now, strict adherence to preventing bounce:
            html.style.overflow = 'hidden';
            html.style.height = '100%';
            html.style.width = '100%';
            html.style.position = 'fixed';
            html.style.overscrollBehavior = 'none'; // Prevent bounce

            body.style.overflow = 'hidden';
            body.style.height = '100%';
            body.style.width = '100%';
            body.style.position = 'fixed';
            body.style.overscrollBehavior = 'none'; // Prevent bounce
        } else {
            html.style.overflow = '';
            html.style.height = '';
            html.style.width = '';
            html.style.position = '';
            html.style.overscrollBehavior = '';

            body.style.overflow = '';
            body.style.height = '';
            body.style.width = '';
            body.style.position = '';
            body.style.overscrollBehavior = '';
        }

        return () => {
            html.style.overflow = '';
            html.style.height = '';
            html.style.width = '';
            html.style.position = '';
            html.style.overscrollBehavior = '';
            body.style.overflow = '';
            body.style.height = '';
            body.style.width = '';
            body.style.position = '';
            body.style.overscrollBehavior = '';
        };
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
                            className="backdrop-blur-2xl text-white px-3 py-5 rounded-2xl shadow-2xl shadow-blue-400/40 border-2 border-white/40 flex flex-col gap-0 relative mr-1 cursor-pointer hover:shadow-blue-300/60 hover:scale-105 hover:border-white/60 transition-all duration-300 w-40"
                            onClick={() => setIsOpen(true)}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.3), 0 20px 40px -10px rgba(59,130,246,0.4)',
                            }}
                        >
                            <p className="text-xs text-white font-medium leading-relaxed text-center drop-shadow-sm min-h-[50px] flex items-center justify-center">
                                {typewriterText}
                                {typewriterText.length < fullMessage.length && (
                                    <span className="inline-block w-0.5 h-3.5 bg-white ml-0.5 animate-pulse"></span>
                                )}
                            </p>

                            {/* Arrow pointing to button */}
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 backdrop-blur-md rotate-45 border-r-2 border-t-2 border-white/40" style={{ background: 'rgba(255,255,255,0.2)' }}></div>

                            {/* Close badge button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowWelcomeBadge(false);
                                }}
                                className="absolute -top-2 -right-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-0.5 transition-colors"
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
                            "w-32 h-28 rounded-full transition-all duration-300 relative flex items-center justify-center !overflow-visible",
                            isOpen ? "bg-slate-800 text-white shadow-2xl border border-white/10 w-16 h-16" : "bg-transparent shadow-none border-none hover:scale-105"
                        )}
                    >
                        {isOpen ? <X className="w-8 h-8" /> : (
                            <>
                                <div className="relative w-full h-full flex items-center justify-center !overflow-visible">
                                    <img
                                        src="/assets/syd_final_diecut.png"
                                        alt="Chat"
                                        className="w-full h-full max-w-none object-contain drop-shadow-xl transform transition-transform duration-300"
                                    />
                                </div>
                                {/* Notification Dot */}
                                <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse z-10" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>


            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Backdrop Curtain (Prevents "revealing site" on overscroll) */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[90] bg-[#0f172a] touch-none md:hidden"
                        />

                        <motion.div
                            key="chat-window"
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            // Mobile: Fixed top-0, Dynamic JS Height (Visual Viewport)
                            // Desktop: Fixed bottom-24 right-6, 450px width, 700px height
                            style={{
                                height: viewportHeight ? `${viewportHeight}px` : undefined,
                                top: viewportHeight ? 0 : undefined
                            }}
                            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 w-full md:w-[450px] md:h-[700px] bg-[#0f172a]/95 backdrop-blur-xl border-none md:border border-slate-700/50 rounded-none md:rounded-3xl shadow-none md:shadow-2xl flex flex-col overflow-hidden overscroll-none touch-none z-[100] origin-bottom-right"
                        >
                            {/* Header: Flex fixed item */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 flex-shrink-0" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                                <div className="flex items-center gap-3">
                                    <ArchitectAvatar />
                                    <div>
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            SYD
                                            <span className="text-[9px] font-medium px-2 py-0.5 rounded-md backdrop-blur-md border border-white/20 text-blue-200" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)' }}>
                                                Architetto personale
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                Online
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

                            {/* Messages Area: Flex grow item, handles its own scroll */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent overscroll-contain touch-pan-y"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
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
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 bg-blue-600 border-blue-500 text-white">
                                                <User className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <ArchitectAvatar className="w-8 h-8 mt-1 shrink-0" />
                                        )}

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
                                                                <span className="group relative mt-2 cursor-pointer overflow-hidden rounded-lg border border-white/10 block" onClick={() => setSelectedImage(props.src as string)}>
                                                                    <img {...props} className="max-w-full h-auto transition-transform hover:scale-105" />
                                                                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <span className="text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1">
                                                                            <Minimize2 className="w-3 h-3 rotate-45" /> Espandi
                                                                        </span>
                                                                    </span>
                                                                </span>
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

                                {/* Enhanced Loading Indicator */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3"
                                    >
                                        <ArchitectAvatar className="w-8 h-8 shrink-0" />
                                        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                                </div>
                                                <motion.span
                                                    key={typingMessage}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-xs text-slate-400 font-medium"
                                                >
                                                    {typingMessage}
                                                </motion.span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Marker invisibile per autoscroll */}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area: Flex fixed item, standard flow (no absolute/fixed positioning) */}
                            <div className="p-4 pb-8 md:pb-4 bg-slate-900/90 border-t border-white/10 backdrop-blur-md flex-shrink-0 w-full" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                                <div className="flex gap-2 items-end max-w-full">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-white shrink-0"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading}
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        multiple
                                    />

                                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex items-center p-1 focus-within:border-blue-500/50 transition-colors min-w-0">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            onFocus={() => {
                                                // Optional: visual scroll to ensure latest message seen
                                                setTimeout(() => scrollToBottom('smooth'), 100);
                                            }}
                                            placeholder="Descrivi cosa vuoi ristrutturare..."
                                            className="w-full bg-transparent text-white text-sm px-3 py-2 max-h-24 min-h-[44px] focus:outline-none resize-none scrollbar-hide block"
                                            rows={1}
                                            disabled={isLoading}
                                        />
                                        <div className="flex items-center gap-1 pr-1 shrink-0">
                                            <VoiceRecorder onRecordingComplete={handleVoiceRecorded} disabled={isLoading} />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => sendMessage()}
                                        disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
                                        className={cn(
                                            "rounded-xl transition-all duration-300 shrink-0",
                                            input.trim() || selectedImages.length > 0
                                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                : "bg-slate-800 text-slate-500"
                                        )}
                                        size="icon"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
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
                        className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
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
