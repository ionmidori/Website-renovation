
import { NextResponse } from 'next/server';
import { generateUploadUrl } from '@/lib/legacy-api';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, fileName, contentType } = body;

        console.log('[API] get-upload-url request:', {
            sessionId,
            fileName,
            contentType,
        });

        if (!sessionId || !fileName || !contentType) {
            console.error('[API] Missing required fields:', { sessionId, fileName, contentType });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 🔒 AUTH VERIFICATION
        const { auth } = await import('@/lib/firebase-admin');
        const authHeader = req.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            await auth().verifyIdToken(authHeader.split('Bearer ')[1]);
        } catch (e) {
            console.error('[API] Auth failed:', e);
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        console.log('[API] Calling generateUploadUrl...');
        const urls = await generateUploadUrl({
            sessionId,
            fileName,
            contentType
        });

        console.log('[API] Generated URLs:', {
            uploadUrlPrefix: urls.uploadUrl.substring(0, 80) + '...',
            publicUrlPrefix: urls.publicUrl.substring(0, 80) + '...',
        });

        return NextResponse.json({ success: true, ...urls });

    } catch (error) {
        console.error('[API] Error generating upload URL:', error);
        console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
