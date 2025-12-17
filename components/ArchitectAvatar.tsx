import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ArchitectAvatar({ className }: { className?: string }) {
    return (
        <div className={cn("relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 shadow-lg group", className)}>
            <Image
                src="/assets/syd_avatar_v3.png"
                alt="SYD Avatar"
                fill
                sizes="48px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
            />
            {/* Hologram Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        </div>
    );
}

