'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/projects-api';
import { Project } from '@/types/projects';
import ConstructionDetailsForm from '@/components/dashboard/ConstructionDetailsForm';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProject() {
            try {
                setLoading(true);
                const data = await projectsApi.getProject(projectId);

                if (data === null) {
                    setError('Progetto non trovato');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1500);
                    return;
                }

                setProject(data);
                setError(null);
            } catch (err) {
                console.error('[SettingsPage] Error loading project:', err);
                setError('Errore nel caricamento');
            } finally {
                setLoading(false);
            }
        }

        if (projectId && !authLoading && user) {
            loadProject();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [projectId, authLoading, user, router]);

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin shadow-lg shadow-luxury-gold/10" />
                    <div className="absolute inset-0 bg-luxury-gold/5 blur-xl rounded-full" />
                </div>
                <p className="mt-8 text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs animate-pulse">
                    Configurazione in corso...
                </p>
            </div>
        );
    }

    // Error State
    if (error || !project) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-8 text-center max-w-md glass-premium p-10 rounded-[2.5rem] border-red-500/20 shadow-2xl">
                    <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-luxury-text mb-3 font-serif">
                            Accesso <span className="text-red-500 italic">Negato</span>
                        </h2>
                        <p className="text-luxury-text/60 font-medium leading-relaxed">
                            {error || 'Il progetto richiesto non è accessibile o è stato rimosso.'}
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="h-12 px-8 bg-luxury-bg border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
                    >
                        Torna alla Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Success - Render Settings Form
    return (
        <div className="flex flex-col h-full w-full relative animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Area */}
            <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 py-8 bg-luxury-bg/80 backdrop-blur-xl border-b border-luxury-gold/10 mb-8">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl border border-luxury-gold/20 bg-luxury-gold/5 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg transition-all transform hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-luxury-text font-serif tracking-tight">
                            Dettagli <span className="text-luxury-gold italic">Tecnici</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-luxury-teal animate-pulse" />
                            <p className="text-xs text-luxury-text/50 font-bold uppercase tracking-[0.15em]">
                                {project.title}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="px-4 py-2 text-right">
                        <p className="text-[10px] text-luxury-text/40 font-bold uppercase tracking-widest">Ultima Modifica</p>
                        <p className="text-xs text-luxury-text/80 font-serif font-bold">Oggi, 14:30</p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full pb-20">
                <ConstructionDetailsForm
                    sessionId={projectId}
                    initialData={project.construction_details}
                />
            </div>
        </div>
    );
}
