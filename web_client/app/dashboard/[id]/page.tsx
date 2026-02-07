'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';
import { projectsApi } from '@/lib/projects-api';
import { Project } from '@/types/projects';
import { Loader2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Assuming this path for useAuth
import ProjectInfoCard from '@/components/dashboard/ProjectInfoCard';
import { cn } from '@/lib/utils';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const { user, loading: authLoading } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMobileInfo, setShowMobileInfo] = useState(false);

    useEffect(() => {
        async function loadProject() {
            try {
                setLoading(true);
                const data = await projectsApi.getProject(projectId);

                if (data === null) {
                    setError('PROGETTO_NON_TROVATO_FRONTEND');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1500);
                    return;
                }

                setProject(data);
                setError(null);
            } catch (err) {
                console.error('[ProjectPage] Error loading project:', err);
                setError('Errore nel caricamento');
            } finally {
                setLoading(false);
            }
        }

        // ONLY trigger load if auth is finished and we have a user
        if (projectId && !authLoading && user) {
            loadProject();
        } else if (!authLoading && !user) {
            // Not authenticated, redirect to landing or wait for dialog
            setLoading(false);
        }
    }, [projectId, authLoading, user, router]);

    // Loading State
    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-1000">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-luxury-gold/10 border-t-luxury-gold rounded-full animate-spin shadow-[0_0_30px_rgba(233,196,106,0.2)]" />
                    <div className="absolute inset-0 bg-luxury-gold/5 blur-2xl rounded-full animate-pulse" />
                </div>
                <p className="mt-10 text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">
                    Accesso all&apos;Ingegneria AI...
                </p>
            </div>
        );
    }

    // Error State
    if (error || !project) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] p-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-8 text-center max-w-md glass-premium p-12 rounded-[3rem] border-red-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                    <div className="p-6 bg-red-500/10 rounded-[2rem] border border-red-500/20 shadow-inner">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-luxury-text mb-4 font-serif italic">
                            Progetto <span className="text-red-500">Omesso</span>
                        </h2>
                        <p className="text-luxury-text/50 font-medium leading-relaxed">
                            {error === 'PROGETTO_NON_TROVATO_FRONTEND'
                                ? 'Il cantiere richiesto non è presente nel database o l&apos;accesso è stato revocato.'
                                : 'Si è verificato un errore critico nel recupero dei dati del progetto.'}
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="h-14 px-10 bg-luxury-bg border border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg font-bold rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl"
                    >
                        Rientra in Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Success - Render Dashboard Layout
    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-luxury-bg">
            {/* 📱 Mobile Details Toggle (Top Bar / Floating) */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-luxury-gold/10 bg-luxury-bg/50 backdrop-blur-md z-30">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-luxury-teal animate-pulse" />
                    <h2 className="text-xs font-bold text-luxury-text/80 uppercase tracking-widest truncate max-w-[200px]">
                        {project.title}
                    </h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileInfo(!showMobileInfo)}
                    className="text-luxury-gold hover:bg-luxury-gold/10 gap-2 border border-luxury-gold/20 rounded-xl px-4"
                >
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Info</span>
                </Button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
                {/* 💬 Main Chat Area (75% on Desktop) */}
                <main className="flex-1 flex flex-col min-h-0 relative bg-black/20">
                    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-luxury-gold" /></div>}>
                        <ChatWidget key={projectId} projectId={projectId} variant="inline" />
                    </Suspense>
                </main>

                {/* 📋 Project Info Sidebar (25% on Desktop) */}
                <aside className={cn(
                    "w-full lg:w-[320px] xl:w-[380px] bg-luxury-bg/80 backdrop-blur-2xl border-l border-luxury-gold/5 lg:block transition-all duration-500 ease-in-out p-6",
                    "fixed inset-y-0 right-0 z-[100] lg:relative lg:z-auto",
                    showMobileInfo ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}>
                    {/* Mobile Close Handle */}
                    <div className="lg:hidden flex justify-between items-center mb-8">
                        <h3 className="text-lg font-serif font-bold text-luxury-gold italic">Dettagli Progetto</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMobileInfo(false)}
                            className="rounded-full bg-white/5"
                        >
                            <ChevronRight className="w-5 h-5 text-luxury-text/40" />
                        </Button>
                    </div>

                    <div className="h-full overflow-y-auto no-scrollbar pb-20 lg:pb-0">
                        <ProjectInfoCard project={project} />
                    </div>
                </aside>

                {/* Mobile Backdrop */}
                {showMobileInfo && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
                        onClick={() => setShowMobileInfo(false)}
                    />
                )}
            </div>
        </div>
    );
}
