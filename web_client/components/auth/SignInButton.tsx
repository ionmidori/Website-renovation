'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from './AuthDialog';

export interface SignInButtonProps {
    className?: string;
    onLoginClick?: () => void;
}

import Link from 'next/link';

export function SignInButton({ className, onLoginClick }: SignInButtonProps) {
    const { user, loading, logout } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleLoginClick = () => {
        if (onLoginClick) {
            onLoginClick();
        } else {
            setDialogOpen(true);
        }
    };

    if (loading) {
        return <Button variant="ghost" size="sm" className={className} disabled>Loading...</Button>;
    }

    // Don't show anything for anonymous users (they're already "logged in" technically)
    // we normally show the login button for anonymous users to allow them to "upgrade"
    // checking isAnonymous === true means they haven't signed in with social/email yet.
    if (user?.isAnonymous) {
        return (
            <>
                <Button
                    onClick={handleLoginClick}
                    variant="outline"
                    size="sm"
                    className={cn("gap-2 border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg transition-colors", className)}
                >
                    <LogIn className="w-4 h-4" />
                    Accedi
                </Button>
                {!onLoginClick && <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
            </>
        );
    }

    if (user) {
        return (
            <div className={cn("flex items-center gap-3", className)}>
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                    {user.photoURL ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 group-hover:border-luxury-gold transition-colors">
                            <Image
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                fill
                                sizes="32px"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-luxury-gold transition-colors">
                            <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-luxury-gold" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 hidden lg:block group-hover:text-luxury-gold transition-colors">
                        {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <>
            <Button
                onClick={handleLoginClick}
                variant="outline"
                size="sm"
                className={cn("gap-2 border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg transition-colors", className)}
            >
                <LogIn className="w-4 h-4" />
                Accedi
            </Button>
            {!onLoginClick && <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
        </>
    );
}
