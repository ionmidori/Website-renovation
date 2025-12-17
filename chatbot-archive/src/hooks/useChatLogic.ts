
import { useState, useCallback, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatStep } from '@/lib/types';
import { useRenovation } from '@/context/RenovationContext';

export const useChatLogic = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<ChatStep>('IDLE');
    const [error, setError] = useState<string | null>(null);
    const { setFurnitureStyle } = useRenovation();

    // Manual Input State
    const [input, setInput] = useState('');


    // Vercel AI SDK Hook
    const chatHelpers = useChat({
        api: '/api/chat',
        maxSteps: 5,
        initialMessages: [
            {
                id: 'init-1',
                role: 'assistant',
                content: "Ciao! Sono il tuo Consulente Tecnico per ristrutturazioni. 🏗️\nDimmi quale stanza vuoi rinnovare o carica una foto per iniziare!\nPosso generare un'anteprima visiva o raccogliere i dati per un preventivo."
            }
        ],
        onError: (err: Error) => {
            console.error("AI SDK Error:", err);
            setError(`Errore: ${err.message || "Problema di connessione"}`);
        }
    });

    const { messages, isLoading, append } = chatHelpers;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const content = input;
        setInput('');

        try {
            if (!append) return;
            await append({
                role: 'user',
                content
            });
        } catch (e) {
            console.error("Send error", e);
        }
    };

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError("Solo immagini JPG/PNG.");
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;

                if (append) {
                    await append({
                        role: 'user',
                        content: "Ecco la foto della mia stanza. Vorrei vedere un'anteprima rinnovata.",
                        experimental_attachments: [{
                            name: file.name,
                            contentType: file.type,
                            url: base64
                        }]
                    });
                }
            };
        } catch (err) {
            setError("Errore upload.");
            console.error(err);
        }
    }, [append]);

    const handleStyleSelect = useCallback((styleId: string, styleName: string) => {
        setFurnitureStyle(styleId as 'minimal_zen' | 'industrial_loft' | 'scandi' | 'rustic_modern' | 'japandi' | 'boho_chic' | 'luxury_classic');

        if (append) {
            append({
                role: 'user',
                content: `Preferisco lo stile ${styleName}.`
            });
        }
    }, [append, setFurnitureStyle]);

    const handleEmailSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(e);
    }, [handleSubmit]);

    return {
        isOpen,
        setIsOpen,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        handleFileUpload,
        handleStyleSelect,
        handleEmailSubmit,
        step,
        error,
        isLoading
    };
};
