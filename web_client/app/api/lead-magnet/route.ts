
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase } from '@/lib/firebase-admin';

// Initialize Firebase Admin to verify tokens or get user info if needed
initializeFirebase();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, quote_summary, session_id } = body;

        // Get the Authorization header from the client request (Firebase ID Token)
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
        }

        // Forward to Python Backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const response = await fetch(`${backendUrl}/api/submit-lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader // Pass the token through
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                quote_summary,
                session_id
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error:", errorText);
            return NextResponse.json({ error: "Failed to submit lead to backend" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error in /api/lead-magnet:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
