
import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoTrimmerProps {
    file: File;
    initialStart?: number;
    initialEnd?: number;
    onSave: (start: number, end: number) => void;
    onClose: () => void;
}

export function VideoTrimmer({ file, initialStart = 0, initialEnd, onSave, onClose }: VideoTrimmerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Range State
    const [start, setStart] = useState(initialStart);
    const [end, setEnd] = useState(initialEnd || 30); // Default 30s or duration (set on load)

    // Preview URL
    const [videoUrl, setVideoUrl] = useState<string>('');

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Handle Metadata Load
    const onLoadedMetadata = () => {
        if (videoRef.current) {
            const d = videoRef.current.duration;
            setDuration(d);
            if (!initialEnd) {
                setEnd(Math.min(d, 30)); // Default max 30s
            }
        }
    };

    // Loop Logic
    const onTimeUpdate = () => {
        if (videoRef.current) {
            if (videoRef.current.currentTime >= end) {
                videoRef.current.currentTime = start;
                // Optional: pause at end instead of loop? Loop is better for checking cut.
                // videoRef.current.pause();
                // setIsPlaying(false);
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    // Calculate percentages for slider
    const leftPos = (start / duration) * 100;
    const rightPos = (end / duration) * 100;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-semibold">Taglia Video</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black flex items-center justify-center group">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onLoadedMetadata={onLoadedMetadata}
                        onTimeUpdate={onTimeUpdate}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                    />

                    {/* Play Overlay */}
                    {!isPlaying && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
                            onClick={togglePlay}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                <Play className="w-8 h-8 text-white fill-current ml-1" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6">
                    {/* Info */}
                    <div className="flex justify-between text-sm text-slate-400 font-mono">
                        <span>{start.toFixed(1)}s</span>
                        <span className={end - start > 30.5 ? "text-red-400" : "text-blue-400"}>
                            Duration: {(end - start).toFixed(1)}s
                        </span>
                        <span>{end.toFixed(1)}s</span>
                    </div>

                    {/* Slider Container */}
                    <div className="relative h-12 w-full select-none">
                        {/* Track Background */}
                        <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-700 rounded-full -translate-y-1/2" />

                        {/* Active Range */}
                        {duration > 0 && (
                            <div
                                className={`absolute top-1/2 h-2 rounded-full -translate-y-1/2 ${end - start > 30.5 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ left: `${leftPos}%`, width: `${rightPos - leftPos}%` }}
                            />
                        )}

                        {/* Start Thumb */}
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.1}
                            value={start}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val < end) {
                                    setStart(val);
                                    if (videoRef.current) videoRef.current.currentTime = val;
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto z-20"
                        />
                        {/* Visual Start Thumb */}
                        <div
                            className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-lg -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
                            style={{ left: `${leftPos}%` }}
                        />


                        {/* End Thumb */}
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.1}
                            value={end}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val > start) {
                                    setEnd(val);
                                    if (videoRef.current) videoRef.current.currentTime = val; // Preview end frame? No, maybe standard behavior.
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto z-20"
                        />
                        {/* Visual End Thumb */}
                        <div
                            className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-lg -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
                            style={{ left: `${rightPos}%` }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} className="text-slate-300">
                            Annulla
                        </Button>
                        <Button
                            onClick={() => onSave(start, end)}
                            className="bg-blue-600 hover:bg-blue-500"
                            disabled={end - start > 31} // Allow strict 30s + tolerance
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Conferma Taglio
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
