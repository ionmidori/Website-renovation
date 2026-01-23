'use client';

export function SydLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Metallic Bars with slight teal glow */}
            <div className="flex flex-col gap-1 drop-shadow-[0_0_8px_rgba(42,157,143,0.3)]">
                <div className="h-1.5 w-12 rounded-sm bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />
                <div className="h-1.5 w-12 rounded-sm bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400" />
                <div className="h-1.5 w-12 rounded-sm bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600" />
                <div className="h-1.5 w-12 rounded-sm bg-gradient-to-r from-black via-gray-900 to-black" />
            </div>

            {/* Text with subtle gold neon glow */}
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold leading-none tracking-tight drop-shadow-[0_0_10px_rgba(233,196,106,0.4)]">
                    <span className="text-luxury-gold">
                        SYD BIOEDILIZIA
                    </span>
                </h1>
                <p className="text-[10px] font-bold text-luxury-gold tracking-wide mt-0.5 opacity-90">
                    IMPRESA EDILE - COIBENTAZIONI TERMICHE
                </p>
            </div>
        </div>
    );
}
