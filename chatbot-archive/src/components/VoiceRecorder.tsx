import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (file: File) => void;
    disabled?: boolean;
    maxDurationSeconds?: number; // Nuovo parametro opzionale
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onRecordingComplete,
    disabled,
    maxDurationSeconds = 60 // Default: 60 secondi
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(maxDurationSeconds); // Timer

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Pulizia del timer se il componente viene smontato
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Reset del timer
            setTimeLeft(maxDurationSeconds);

            // Avvia il conto alla rovescia
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording(); // STOP AUTOMATICO a 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Controllo extra sulla dimensione (opzionale, es. max 5MB)
                if (blob.size > 5 * 1024 * 1024) {
                    alert("File audio troppo grande. Riprova con un messaggio più breve.");
                    setIsProcessing(false);
                    return;
                }

                const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });

                setIsProcessing(false);
                onRecordingComplete(file);

                // Ferma tracce e timer
                stream.getTracks().forEach(track => track.stop());
                if (timerRef.current) clearInterval(timerRef.current);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Errore microfono:", err);
            alert("Impossibile accedere al microfono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            setIsProcessing(true);
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Funzione per formattare il tempo (es. 0:59)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="relative flex items-center">
            {/* Mostra il timer solo mentre registra */}
            {isRecording && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow animate-pulse">
                    {formatTime(timeLeft)}
                </span>
            )}

            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isProcessing}
                className={`p-2 md:p-3 rounded-full transition-all duration-200 flex items-center justify-center relative
            ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-200'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/5'
                    }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                title={isRecording ? "Ferma ora" : "Registra vocale (Max 60s)"}
            >
                {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                    // Icona Quadrata + Timer visivo
                    <Square className="w-5 h-5 fill-current" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}

                {/* Cerchio di progresso SVG (Opzionale, effetto "WhatsApp") */}
                {isRecording && (
                    <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                        <path
                            className="text-red-300"
                            strokeDasharray="100, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeOpacity="0.3"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
};
