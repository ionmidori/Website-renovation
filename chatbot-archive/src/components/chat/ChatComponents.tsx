
import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Assets
const avatarImg = '/assets/syd_avatar.png';

export interface StyleOption {
    id: string;
    name: string;
    img: string;
}

// --- Header ---
export const ChatHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="bg-sage-DEFAULT p-4 flex items-center justify-between text-white rounded-t-2xl shadow-md cursor-pointer" onClick={onClose}>
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-40 animate-pulse"></div>
                <img src={avatarImg} alt="Assistant SYD" className="relative w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm z-10" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white z-20 animate-bounce"></div>
            </div>
            <div>
                <h3 className="font-bold text-sm">Assistente SYD</h3>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-sage-light opacity-90 uppercase tracking-wide">Online</p>
                    <span className="flex items-center gap-1 text-[8px] text-green-300 font-bold uppercase tracking-tighter bg-white/10 px-1 py-0.5 rounded border border-white/20">
                        Secure Mode
                    </span>
                </div>
            </div>

        </div>
        <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
        </button>
    </div>
);

// --- Messages ---
// --- Messages ---
import { Message } from 'ai';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const { role, content, toolInvocations } = message;
    const isBot = role === 'assistant' || role === 'system';

    // Check for Markdown Image
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const imageMatch = content.match(markdownImageRegex);
    const imageUrl = imageMatch ? imageMatch[1] : (content.startsWith('http') || content.startsWith('data:image') ? content : null);

    // Check for Tool Result (if tool was called and returned success with an image)
    const toolImage = (toolInvocations?.find(t => t.toolName === 'generate_room_image' && 'result' in t) as any)?.result?.imageUrl;

    const displayImage = imageUrl || toolImage;
    const textContent = content.replace(markdownImageRegex, '').trim();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("flex w-full mb-4", isBot ? "justify-start" : "justify-end")}
        >
            {isBot && (
                <img src={avatarImg} alt="Bot" className="w-8 h-8 rounded-full mr-2 border border-white/10 self-end mb-1" />
            )}
            <div className={clsx(
                "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed",
                isBot ? "bg-white text-dark-DEFAULT rounded-bl-none border border-gray-100" : "bg-sage-dark text-white rounded-br-none"
            )}>
                {displayImage && (
                    <img
                        src={displayImage}
                        alt="Rentering"
                        className="w-full h-auto rounded-lg bg-black/5 mb-2"
                    />
                )}

                {/* Tool Loading State Removed as per user request */}

                {textContent && <p className="whitespace-pre-wrap">{textContent}</p>}
            </div>
        </motion.div>
    );
};

// --- Style Carousel ---
export const StyleCarousel: React.FC<{ styles: StyleOption[]; onSelect: (id: string, name: string) => void }> = ({ styles, onSelect }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex overflow-x-auto gap-3 pb-4 pt-2 snap-x scrollbar-hide px-1"
    >
        {styles.map(s => (
            <div
                key={s.id}
                onClick={() => onSelect(s.id, s.name)}
                className="flex-shrink-0 w-32 cursor-pointer group snap-center"
            >
                <div className="relative overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-sage-light">
                    <img src={s.img} alt={s.name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <p className="text-white text-[10px] font-bold truncate">{s.name}</p>
                    </div>
                </div>
            </div>
        ))}
    </motion.div>
);
