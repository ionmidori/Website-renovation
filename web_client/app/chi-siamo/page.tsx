import { Suspense } from 'react';
import { Navbar } from '@/components/sections/Navbar';
import { About } from '@/components/sections/About';
import { Footer } from '@/components/sections/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ChiSiamoPage() {
    return (
        <main className="min-h-screen bg-luxury-bg text-luxury-text overflow-x-hidden selection:bg-luxury-teal/30">
            <Navbar />
            {/* Spacer for fixed navbar */}
            <div className="pt-20">
                <About />
            </div>
            <Footer />
            <Suspense fallback={<div />}>
                <ChatWidget />
            </Suspense>
        </main>
    );
}
