'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AssetGallery } from '@/components/dashboard/AssetGallery';
import { extractMediaFromMessages, groupAssetsByType, MediaAsset } from '@/lib/media-utils';
import { Loader2, FileImage } from 'lucide-react';
import { useChatHistory } from '@/hooks/useChatHistory';

export default function ProjectFilesPage() {
    const params = useParams();
    const projectId = params.id as string;

    const { historyLoaded, historyMessages } = useChatHistory(projectId);
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    useEffect(() => {
        if (historyLoaded && historyMessages.length > 0) {
            const extractedAssets = extractMediaFromMessages(historyMessages);
            setAssets(extractedAssets);
        }
    }, [historyLoaded, historyMessages]);

    const groupedAssets = groupAssetsByType(assets);
    const filteredAssets = selectedFilter === 'all'
        ? assets
        : groupedAssets[selectedFilter] || [];

    const filterOptions = [
        { value: 'all', label: 'Tutti', count: assets.length },
        { value: 'image', label: 'Immagini', count: groupedAssets.image?.length || 0 },
        { value: 'render', label: 'Render', count: groupedAssets.render?.length || 0 },
        { value: 'quote', label: 'Preventivi', count: groupedAssets.quote?.length || 0 },
    ];

    // Loading State
    if (!historyLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin shadow-lg shadow-luxury-gold/10" />
                    <div className="absolute inset-0 bg-luxury-gold/5 blur-xl rounded-full" />
                </div>
                <p className="mt-8 text-luxury-gold font-bold tracking-[0.2em] uppercase text-xs animate-pulse">
                    Caricamento Archivio...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto space-y-10 py-6">
            {/* Header */}
            <div className="relative border-b border-luxury-gold/10 pb-8">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-luxury-teal/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-luxury-text font-serif leading-tight flex items-center gap-4">
                        <div className="p-3 bg-luxury-gold/10 rounded-2xl border border-luxury-gold/20 shadow-lg shadow-luxury-gold/5">
                            <FileImage className="w-8 h-8 text-luxury-gold" />
                        </div>
                        Galleria <span className="text-luxury-gold italic">& File</span>
                    </h1>
                    <p className="text-luxury-text/50 mt-3 max-w-2xl font-medium text-sm md:text-base leading-relaxed">
                        Tutte le immagini, render e preventivi generati dalla conversazione con SYD.
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setSelectedFilter(option.value)}
                        className={`
                            relative px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-500 border overflow-hidden group
                            ${selectedFilter === option.value
                                ? 'bg-luxury-gold border-luxury-gold text-luxury-bg shadow-2xl shadow-luxury-gold/30'
                                : 'glass-premium border-luxury-gold/10 text-luxury-text/60 hover:text-luxury-text hover:border-luxury-gold/30 hover:bg-white/5'
                            }
                        `}
                    >
                        {/* Hover Shine Effect */}
                        {selectedFilter !== option.value && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        )}

                        <span className="relative z-10 tracking-tight">{option.label}</span>
                        {option.count > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-extrabold relative z-10 ${selectedFilter === option.value
                                    ? 'bg-luxury-bg/20 text-luxury-bg'
                                    : 'bg-luxury-gold/10 text-luxury-gold'
                                }`}>
                                {option.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Gallery */}
            <AssetGallery assets={filteredAssets} />
        </div>
    );
}
