'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import ArchitectAvatar from '@/components/ArchitectAvatar';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Simple Markdown Image Parser to handle Base64 images without external libs
const renderMessageContent = (text: string, onImageClick?: (src: string) => void) => {
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    const alt = match[1];
    const src = match[2];
    parts.push(
      <div
        key={`img-${match.index}`}
        className="my-3 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onImageClick?.(src)}
      >
        <img src={src} alt={alt} className="w-full h-auto object-cover" />
      </div>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Ciao! Sono SYD, il tuo Architetto Personale.\n\nPosso aiutarti con:\n• Preventivi personalizzati\n• Visualizzazioni 3D del progetto\n• Consigli su design e materiali\n\nCome posso esserti utile? 🏠✨'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; preview: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup image previews
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [uploadedImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleAudioUpload = async (audioFile: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Converti audio in Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);

      reader.onload = async (e) => {
        const base64Audio = e.target?.result as string;

        // Messaggio utente fittizio per la UI
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: '🎤 Messaggio vocale inviato'
        };

        setMessages(prev => [...prev, userMessage]);

        // 2. Invia a Gemini come audio
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            images: [base64Audio] // Usiamo questo campo temporaneamente anche per l'audio, gestito dall'API
          })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'Non ho potuto elaborare il messaggio vocale.'
        };
        setMessages(prev => [...prev, assistantMessage]);
      };

    } catch (err: any) {
      console.error("Errore invio audio", err);
      setError(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Errore nell\'invio del vocale.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || '🖼️ Analizza questa immagine'
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Convert images to base64 if present
      let base64Images: string[] = [];
      if (uploadedImages.length > 0) {
        const imagePromises = uploadedImages.map(img => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(img.file);
          });
        });
        base64Images = await Promise.all(imagePromises);

        // Clear images
        uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
        setUploadedImages([]);
      }

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          images: base64Images.length > 0 ? base64Images : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Mi dispiace, non ho potuto generare una risposta.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Si è verificato un errore. Riprova più tardi.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">

      {/* Sfondo Gradiente Moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      {/* Hero Section */}
      <div className="z-10 text-center space-y-4 px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 tracking-tight leading-tight">
            Ristruttura
          </h1>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-1 leading-tight">
            con l'AI
          </h2>
        </motion.div>

        <motion.p
          className="text-slate-300 text-base md:text-lg max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Il tuo architetto virtuale è pronto a trasformare i tuoi sogni in realtà
        </motion.p>

        {!isOpen && (
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-blue-400 text-xs md:text-sm mt-6 font-medium"
          >
            Inizia la tua consulenza gratuita ↓
          </motion.div>
        )}
      </div>

      {/* PULSANTE GALLEGGIANTE */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] z-50 flex items-center justify-center group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <span className="text-2xl relative z-10">💬</span>
        </motion.button>
      )}

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[90vh] max-h-[850px] bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl"
            style={{
              boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="relative p-4 flex justify-between items-center border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-20 h-20 overflow-visible relative"
                  animate={isLoading ? {
                    y: [0, -4, 0],
                    rotate: [0, 2, -2, 0]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isLoading ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <ArchitectAvatar />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    SYD
                    {isLoading && (
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <p className="text-xs text-blue-200/80 font-medium">Architetto Personale • Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20'
                      : 'bg-slate-800/80 text-slate-100 border border-white/5 rounded-bl-none'
                      }`}
                  >
                    <div className="markdown-content whitespace-pre-wrap">
                      {renderMessageContent(m.content, setSelectedImage)}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-xs mx-4 mb-2">
                  Si è verificato un errore. Riprova.
                </div>
              )}
            </div>

            {/* Image Preview */}
            <AnimatePresence>
              {uploadedImages.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-2 flex gap-2 overflow-x-auto"
                >
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group min-w-[60px]">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 relative">
                        <Image
                          src={img.preview}
                          alt="preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form */}
            <div className="p-3 md:p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="flex gap-1.5 md:gap-2 items-center">

                {/* Image Upload Button */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 md:p-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-all border border-white/5 group"
                  title="Carica immagini"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                {/* Voice Recorder */}
                <VoiceRecorder onRecordingComplete={handleAudioUpload} disabled={isLoading} />

                <input
                  className="flex-1 min-w-0 bg-slate-800/50 border border-white/10 rounded-full px-3 md:px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-500 transition-all font-light"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "SYD sta scrivendo..." : "Scrivi il tuo messaggio..."}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && uploadedImages.length === 0)}
                  className="p-2 md:p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 3 3 9-3 9 19-9Z" />
                      <path d="M6 12h16" />
                    </svg>
                  )}
                </button>
              </form>

              <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-500">
                  Powered by Gemini AI • SYD Renovation Assistant
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
              />

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
                >
                  Chiudi
                </button>
                <a
                  href={selectedImage}
                  download="progetto-syd.png"
                  className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                  Scarica HD
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
