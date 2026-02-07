import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Send, Share2 } from 'lucide-react';  // Added Share2
import { useParallax } from '@/hooks/useParallax';  // 🎮 Gyroscope
import { useWebShare } from '@/hooks/useWebShare';  // 📤 Native Share

interface ImageLightboxProps {
    imageUrl: string | null;
    onClose: () => void;
}

/**
 * Image lightbox modal for fullscreen image preview.
 * Now includes:
 * - 🎮 Gyroscope parallax effect (subtle holographic tilt)
 * - 📤 Native Web Share API
 */
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// ... imports remain the same

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
    // 🎮 Parallax effect (enabled only when lightbox is open)
    const { getTransform, isSupported: parallaxSupported } = useParallax(!!imageUrl);

    // 📤 Web Share API
    const { canShare, shareRender } = useWebShare();

    const handleShare = async () => {
        if (imageUrl) {
            await shareRender(imageUrl, 'Rendering');
        }
    };
    return (
        <AnimatePresence>
            {imageUrl && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    role="dialog"
                    aria-label="Anteprima immagine"
                    className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <div
                        className="relative w-full h-full flex flex-col items-center justify-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 🔍 Pinch to Zoom Wrapper */}
                        {/* @ts-ignore */}
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={4}
                            centerOnInit
                            limitToBounds={true}
                        >
                            {/* @ts-ignore */}
                            <TransformComponent
                                wrapperClass="!w-full !h-[80vh] flex items-center justify-center"
                                contentClass="flex items-center justify-center"
                            >
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    src={imageUrl}
                                    alt="Full preview"
                                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/10"
                                    style={parallaxSupported ? getTransform(15) : {}}  // 🎮 Apply parallax
                                />
                            </TransformComponent>
                        </TransformWrapper>

                        <div className="absolute bottom-8 flex gap-4 z-[130]">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                aria-label="Chiudi anteprima"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Chiudi
                            </Button>

                            {/* 📤 Native Share Button (if supported) */}
                            {canShare && (
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    aria-label="Condividi rendering"
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Condividi
                                </Button>
                            )}

                            <a
                                href={imageUrl}
                                download="renovation-ai-vision.png"
                                aria-label="Scarica immagine"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                            >
                                <Send className="w-4 h-4 mr-2 rotate-180" />
                                Scarica HD
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
