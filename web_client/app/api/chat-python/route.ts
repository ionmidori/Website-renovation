import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { createInternalToken } from '@/lib/auth/jwt';

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
    try {
        // 1. Extract Firebase Token (Optional for Guest)
        const authHeader = req.headers.get('Authorization');
        let firebaseUser = { uid: `guest-${crypto.randomUUID()}`, email: 'guest@renovation.ai' };

        if (authHeader?.startsWith('Bearer ')) {
            const firebaseToken = authHeader.replace('Bearer ', '');
            try {
                firebaseUser = await admin.auth().verifyIdToken(firebaseToken);
            } catch (error) {
                console.error('Firebase token validation failed:', error);
                // Fallback to guest or return 401? 
                // Better to return 401 if token provided but invalid.
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        }

        // 3. Create Internal JWT (signed by Next.js)
        const internalToken = createInternalToken({
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'unknown',
        });

        // 4. Read request body
        const body = await req.json();

        // 5. Forward request to Python backend with Internal JWT
        const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${internalToken}`, // Internal JWT, NOT Firebase
            },
            body: JSON.stringify(body),
        });

        if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text();
            console.error('Python backend error:', errorText);
            return NextResponse.json(
                { error: 'Backend error', details: errorText },
                { status: pythonResponse.status }
            );
        }

        // 6. CRITICAL: Stream passthrough WITHOUT buffering
        // Do NOT use await pythonResponse.text() - it waits for entire stream!
        return new NextResponse(pythonResponse.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
