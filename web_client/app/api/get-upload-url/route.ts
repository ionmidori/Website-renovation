
import { NextResponse } from 'next/server';
import { generateUploadUrl } from '@/lib/legacy-api';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, fileName, contentType } = body;

        if (!sessionId || !fileName || !contentType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const urls = await generateUploadUrl({
            sessionId,
            fileName,
            contentType
        });

        return NextResponse.json({ success: true, ...urls });

    } catch (error) {
        console.error('[API] Error generating upload URL:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
