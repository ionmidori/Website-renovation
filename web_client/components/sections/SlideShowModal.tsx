'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const SLIDES = [
    '/slides/summary-slide.png'
];

interface SlideShowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SlideShowModal({ isOpen, onClose }: SlideShowModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // direction state is no longer needed as there's only one slide and no pagination
    // const [direction, setDirection] = useState(0);

    // Reset index when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // paginate function is no longer needed as there's only one slide
    // const paginate = useCallback((newDirection: number) => {
    //     setDirection(newDirection);
    //     setCurrentIndex((prev) => {
    //         let next = prev + newDirection;
    //         if (next < 0) next = SLIDES.length - 1;
    //         if (next >= SLIDES.length) next = 0;
    //         return next;
    //     });
    // }, []);

    // Keyboard navigation (only Escape needed now)
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            // if (e.key === 'ArrowRight') paginate(1); // No pagination
            // if (e.key === 'ArrowLeft') paginate(-1); // No pagination
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]); // paginate removed from dependencies

    // Slide variants for animations
    const variants = {
        enter: () => ({ // direction parameter removed
            // x: direction > 0 ? 1000 : -1000, // x property removed
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            // x: 0, // x property removed
            opacity: 1,
            scale: 1
        },
        exit: () => ({ // direction parameter removed
            zIndex: 0,
            // x: direction < 0 ? 1000 : -1000, // x property removed
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[110] p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Content Container */}
                    <div className="relative w-full h-[90vh] md:h-auto md:max-w-6xl md:aspect-video mx-4 z-[105] flex items-center justify-center">

                        {/* Previous Button - Removed */}
                        {/* Next Button - Removed */}

                        {/* Image Carousel */}
                        <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl bg-black">

                            {/* Ambient Background (Mobile/Fill effect) */}
                            <AnimatePresence initial={false} mode='popLayout'> {/* custom={direction} removed */}
                                <motion.div
                                    key={`bg-${currentIndex}`}
                                    // custom={direction} // custom prop removed
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ opacity: { duration: 0.5 } }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Image
                                        src={SLIDES[currentIndex]}
                                        alt=""
                                        fill
                                        className="object-cover blur-3xl opacity-50 scale-110"
                                        aria-hidden="true"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Main Slide */}
                            <AnimatePresence initial={false} mode='popLayout'> {/* custom={direction} removed */}
                                <motion.div
                                    key={currentIndex}
                                    // custom={direction} // custom prop removed
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        // x: { type: "spring", stiffness: 300, damping: 30 }, // x transition removed
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="absolute inset-0 w-full h-full z-10"
                                >
                                    <Image
                                        src={SLIDES[currentIndex]}
                                        alt="Come funziona SYD" // Alt text updated
                                        fill
                                        priority
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dots Indicator - Removed */}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
