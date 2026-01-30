'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';

/**
 * useAuth Hook
 * 
 * Lightweight wrapper around AuthContext for backward compatibility.
 * All state and logic is managed by AuthProvider.
 * 
 * @deprecated Consider using useAuthContext directly for clarity
 */
export function useAuth() {
    return useAuthContext();
}
