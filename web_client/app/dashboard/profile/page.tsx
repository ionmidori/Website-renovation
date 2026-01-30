'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Lock, Bell, Camera, Save, Loader2 } from "lucide-react";
import NextImage from "next/image";

export default function ProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');

    const initials = user?.displayName
        ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : user?.email ? user.email[0].toUpperCase() : 'U';

    const handleSaveProfile = async () => {
        setIsLoading(true);
        setSuccessMessage(null);

        // Simulate save - in production this would update Firebase
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSuccessMessage('Profilo aggiornato con successo!');
        setIsLoading(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
            {/* Header */}
            <div className="border-b border-luxury-gold/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-luxury-text font-serif flex items-center gap-4">
                    <div className="p-3 bg-luxury-gold/10 rounded-2xl border border-luxury-gold/20 shadow-lg shadow-luxury-gold/5">
                        <User className="w-8 h-8 text-luxury-gold" />
                    </div>
                    Il Mio Profilo
                </h1>
                <p className="text-luxury-text/60 mt-4 font-medium max-w-2xl">
                    Gestisci le informazioni del tuo account e le preferenze personali.
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="glass-premium border-green-500/20 p-4 rounded-xl flex items-center gap-3 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {successMessage}
                </div>
            )}

            {/* Profile Photo Section */}
            <div className="glass-premium border-luxury-gold/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold text-luxury-text flex items-center gap-3">
                    <Camera className="w-5 h-5 text-luxury-gold" />
                    Foto Profilo
                </h2>

                <div className="flex items-center gap-6">
                    <div className="relative group">
                        {user?.photoURL ? (
                            <NextImage
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                width={100}
                                height={100}
                                className="rounded-full border-4 border-luxury-gold/20 shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-luxury-gold/30 bg-luxury-gold/10 flex items-center justify-center text-luxury-gold font-black text-2xl shadow-xl">
                                {initials}
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 p-2 bg-luxury-gold text-luxury-bg rounded-full shadow-lg hover:bg-luxury-gold/90 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p className="text-luxury-text font-medium">Cambia la tua foto profilo</p>
                        <p className="text-luxury-text/50 text-sm">JPG, PNG o GIF. Max 5MB.</p>
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="glass-premium border-luxury-gold/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold text-luxury-text flex items-center gap-3">
                    <Mail className="w-5 h-5 text-luxury-gold" />
                    Informazioni Account
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-luxury-text/70">Nome Completo</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-luxury-gold/10 rounded-xl text-luxury-text placeholder-luxury-text/30 focus:border-luxury-gold/30 focus:outline-none transition-colors"
                            placeholder="Il tuo nome"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-luxury-text/70">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-luxury-gold/10 rounded-xl text-luxury-text placeholder-luxury-text/30 focus:border-luxury-gold/30 focus:outline-none transition-colors"
                            placeholder="email@esempio.com"
                            disabled
                        />
                        <p className="text-xs text-luxury-text/40">L'email non può essere modificata</p>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="glass-premium border-luxury-gold/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold text-luxury-text flex items-center gap-3">
                    <Lock className="w-5 h-5 text-luxury-gold" />
                    Sicurezza
                </h2>

                <div className="space-y-4">
                    <button className="w-full md:w-auto px-6 py-3 bg-white/5 border border-luxury-gold/10 rounded-xl text-luxury-text hover:bg-white/10 hover:border-luxury-gold/20 transition-all flex items-center gap-3">
                        <Lock className="w-4 h-4 text-luxury-gold" />
                        Cambia Password
                    </button>
                    <p className="text-xs text-luxury-text/40">
                        Ultimo accesso: {new Date().toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            {/* Notifications */}
            <div className="glass-premium border-luxury-gold/10 p-8 rounded-2xl space-y-6">
                <h2 className="text-xl font-bold text-luxury-text flex items-center gap-3">
                    <Bell className="w-5 h-5 text-luxury-gold" />
                    Notifiche
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-luxury-gold/30 bg-white/5 text-luxury-gold focus:ring-luxury-gold/30" />
                        <div>
                            <p className="text-luxury-text font-medium group-hover:text-luxury-gold transition-colors">Notifiche Email</p>
                            <p className="text-sm text-luxury-text/50">Ricevi aggiornamenti sui tuoi progetti via email</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-luxury-gold/30 bg-white/5 text-luxury-gold focus:ring-luxury-gold/30" />
                        <div>
                            <p className="text-luxury-text font-medium group-hover:text-luxury-gold transition-colors">Aggiornamenti Preventivi</p>
                            <p className="text-sm text-luxury-text/50">Ricevi notifiche quando i preventivi sono pronti</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-8 py-4 bg-luxury-gold text-luxury-bg font-bold rounded-xl hover:bg-luxury-gold/90 transition-all shadow-lg shadow-luxury-gold/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Salva Modifiche
                </button>
            </div>
        </div>
    );
}
