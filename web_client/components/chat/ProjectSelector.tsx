"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, FolderKanban, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectsApi } from '@/lib/projects-api';
import { ProjectListItem } from '@/types/projects';

interface ProjectSelectorProps {
    currentProjectId: string;
}

export function ProjectSelector({ currentProjectId }: ProjectSelectorProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load projects ONLY when opening to save resources, or on mount? 
    // Better on mount so we can display the name correctly if logic requires, 
    // but here we just show "Select Project" or similar if name is missing? 
    // Actually, we usually want to show the CURRENT project name. 
    // We can infer it from the list.
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const list = await projectsApi.listProjects();
                setProjects(list);
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const currentProject = projects.find(p => p.session_id === currentProjectId);
    const displayName = currentProject ? currentProject.title : "Seleziona Progetto";

    const handleSelect = (projectId: string) => {
        if (projectId === currentProjectId) {
            setIsOpen(false);
            return;
        }

        // UX: Show loading/block interaction immediately? 
        // For now, simple navigation. Page will show global loader.
        setIsOpen(false);
        router.push(`/dashboard/${projectId}`);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-luxury-gold/10 border border-luxury-gold/20 hover:bg-luxury-gold/20 transition-all group"
            >
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase text-luxury-gold/70 font-bold tracking-wider leading-none mb-0.5">
                        Progetto Attivo
                    </span>
                    <span className="text-sm font-medium text-luxury-text leading-none max-w-[120px] truncate">
                        {loading && projects.length === 0 ? "Caricamento..." : displayName}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-luxury-gold/70 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 max-h-[300px] overflow-y-auto rounded-xl border border-luxury-gold/20 bg-[#0f1014]/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col p-1 custom-scrollbar">
                    {loading && projects.length === 0 && (
                        <div className="flex items-center justify-center p-4 text-luxury-gold">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    )}

                    {!loading && projects.length === 0 && (
                        <div className="p-3 text-center text-xs text-white/50">
                            Nessun altro progetto
                        </div>
                    )}

                    {projects.map((proj) => (
                        <button
                            key={proj.session_id}
                            onClick={() => handleSelect(proj.session_id)}
                            className={cn(
                                "flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors",
                                proj.session_id === currentProjectId
                                    ? "bg-luxury-gold/20 text-luxury-gold"
                                    : "hover:bg-white/5 text-luxury-text/80 hover:text-luxury-text"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-md",
                                proj.session_id === currentProjectId ? "bg-luxury-gold/20" : "bg-white/5"
                            )}>
                                <FolderKanban className="w-4 h-4" />
                            </div>
                            <span className="flex-1 truncate text-sm font-medium">
                                {proj.title}
                            </span>
                            {proj.session_id === currentProjectId && (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
