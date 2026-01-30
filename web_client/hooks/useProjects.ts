import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/projects-api';
import { ProjectListItem } from '@/types/projects';
import { useAuth } from '@/hooks/useAuth';

export function useProjects() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await projectsApi.listProjects();
            // Sort by updated_at desc (just in case backend doesn't)
            const sorted = data.sort((a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
            setProjects(sorted);
            setError(null);
        } catch (err) {
            console.error('[useProjects] Error fetching projects:', err);
            const error = err as Error;
            setError(error.message || 'Errore durante il caricamento dei progetti');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchProjects();
            } else {
                setLoading(false);
                setProjects([]);
            }
        }
    }, [user, authLoading, fetchProjects]);

    return {
        projects,
        loading,
        error,
        refresh: fetchProjects
    };
}
