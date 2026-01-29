import { auth } from '@/lib/firebase';

interface FetchOptions extends RequestInit {
    /**
     * If true, suppresses the automatic injection of the Authorization header.
     */
    skipAuth?: boolean;
}

/**
 * Authenticated API Client
 * 
 * Automatically injects the Firebase ID Token into the 'Authorization' header.
 * Use this instead of raw 'fetch' for all backend API calls.
 */
export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuth, headers, ...rest } = options;

    // Prepare headers object
    const finalHeaders: Record<string, string> = {};

    // Copy existing headers
    if (headers) {
        if (headers instanceof Headers) {
            headers.forEach((val, key) => { finalHeaders[key] = val; });
        } else if (Array.isArray(headers)) {
            headers.forEach(([key, val]) => { finalHeaders[key] = val; });
        } else {
            Object.assign(finalHeaders, headers);
        }
    }

    // Inject Authorization Token
    if (!skipAuth) {
        const user = auth.currentUser;
        if (user) {
            try {
                // forceRefresh=false because Firebase SDK handles auto-refresh internally
                // unless we specifically need to force it (e.g. claims changed)
                const token = await user.getIdToken();
                finalHeaders['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('[ApiClient] Failed to get ID token:', error);
                // We proceed without token? Or throw? 
                // Best practice: proceed, let backend 401 if strict.
            }
        } else {
            // Optional: warn if we expect auth but have none
            // console.warn('[ApiClient] No authenticated user for request:', url);
        }
    }

    // Execute Request
    const response = await fetch(url, {
        ...rest,
        headers: finalHeaders
    });

    // Global Error Handling (Optional)
    if (response.status === 401) {
        console.warn('[ApiClient] 401 Unauthorized - Token might be invalid or expired.');
    }

    return response;
}
