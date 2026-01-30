'use client';

import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectsEmptyState } from '@/components/dashboard/ProjectsEmptyState';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { projectsApi } from '@/lib/projects-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardPage() {
    const { projects, loading, error, refresh } = useProjects();
    const [createLoading, setCreateLoading] = useState(false);
    const router = useRouter();

    const handleCreateProject = async () => {
        setCreateLoading(true);
        try {
            const { session_id } = await projectsApi.createProject({ title: 'Nuovo Progetto' });
            router.push(`/dashboard/${session_id}`);
        } catch (error) {
            console.error('Failed to create project:', error);
            setCreateLoading(false);
        }
    };

    const handleDeleteProject = () => {
        // Refresh the project list after deletion
        refresh();
    };

    return (
        <div className="flex flex-col space-y-10 py-8 px-6 md:px-8 max-w-7xl mx-auto w-full relative">
            {/* Header Area with enhanced spacing */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-luxury-gold/10 pb-10 relative">
                <div className="space-y-3 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-luxury-text font-serif leading-tight">
                        I Miei <span className="text-luxury-gold italic">Progetti</span>
                    </h1>
                    <p className="text-luxury-text/50 max-w-xl font-medium text-sm md:text-base leading-relaxed">
                        Gestisci le tue ristrutturazioni e visualizza i tuoi preventivi intelligenti in un unico posto.
                    </p>
                </div>
                <Button
                    onClick={handleCreateProject}
                    disabled={createLoading}
                    className="h-14 px-8 bg-luxury-teal hover:bg-luxury-teal text-white font-extrabold rounded-2xl shadow-2xl shadow-luxury-teal/30 transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {createLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    ) : (
                        <Plus className="w-5 h-5 mr-3" />
                    )}
                    Nuovo Progetto
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 backdrop-blur-xl animate-shake">
                    <p className="flex items-center gap-3 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Errore: {error}
                    </p>
                </div>
            )
            }

            {/* Content Switcher */}
            {
                loading ? (
                    // Skeleton Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[300px] rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    // Empty State
                    <ProjectsEmptyState />
                ) : (
                    // Project Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project.session_id} project={project} onDelete={handleDeleteProject} />
                        ))}
                    </div>
                )
            }
        </div >
    );
}
