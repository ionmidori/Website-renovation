import React from 'react';
import Image from 'next/image';

export default function ArchitectAvatar() {
    return (
        <div className="antigravity-avatar-wrapper">
            <Image
                src="/assets/syd_avatar_v3.png"
                alt="SYD Avatar"
                fill
                className="avatar-image"
                priority
            />

            {/* Overlay per effetto scanlines/olografico */}
            <div className="hologram-overlay"></div>
        </div>
    );
}