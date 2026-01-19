import { db, storage } from './firebase-admin';

/**
 * Upload base64 encoded image to Firebase Storage
 */
export async function uploadBase64Image(options: {
    base64Data: string;
    sessionId: string;
    prefix?: string;
}): Promise<string> {
    const { base64Data, sessionId, prefix = 'user-uploads' } = options;

    try {
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{20,50}$/.test(sessionId)) {
            throw new Error('Invalid sessionId format');
        }

        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 format');
        }

        const mimeType = matches[1];
        const base64String = matches[2];
        const imageBuffer = Buffer.from(base64String, 'base64');
        const extension = mimeType.split('/')[1];
        const timestamp = Date.now();
        const uniqueId = crypto.randomUUID().split('-')[0];
        const fileName = `${prefix}/${sessionId}/${timestamp}-${uniqueId}.${extension}`;

        const bucket = storage().bucket();
        const file = bucket.file(fileName);

        await file.save(imageBuffer, {
            contentType: mimeType,
            metadata: {
                cacheControl: 'public, max-age=31536000',
                metadata: {
                    uploadedAt: new Date().toISOString(),
                    sessionId: sessionId,
                    source: 'chatbot-upload',
                },
            },
        });

        // Use Signed URL instead of makePublic (works with Uniform Bucket Level Access)
        // Valid for 7 days - ample time for user session and AI processing
        console.log(`[Upload] 🔑 Generating signed URL for: ${fileName}`);

        try {
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            console.log(`[Upload] ✅ Signed URL generated successfully`);
            console.log(`[Upload] 🔗 URL starts with: ${signedUrl.substring(0, 80)}...`);
            return signedUrl;
        } catch (signError) {
            console.error(`[Upload] ❌ Signed URL generation FAILED:`, signError);
            // Fallback to public URL (will fail with UBLA but useful for debugging)
            const fallbackUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.warn(`[Upload] ⚠️ Falling back to public URL: ${fallbackUrl}`);
            return fallbackUrl;
        }

    } catch (error) {
        console.error('[Upload] Error:', error);
        throw error;
    }
}

/**
 * Get conversation context from Firestore
 */
export async function getConversationContext(
    sessionId: string,
    limit: number = 10
): Promise<Array<{ role: string; content: string }>> {
    try {
        const firestore = db();

        // Use 'sessions' collection (matching backend-python schema)
        const messagesRef = firestore
            .collection('sessions')
            .doc(sessionId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(limit);

        const snapshot = await messagesRef.get();

        if (snapshot.empty) return [];

        const messages = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    role: data.role as string,
                    content: data.content as string
                };
            })
            .reverse();

        return messages;

    } catch (error) {
        console.error('[History] Error loading context:', error);
        return [];
    }
}

/**
 * Generate Signed URL for direct client upload (PUT)
 * Uses V4 signing for maximum compatibility
 */
export async function generateUploadUrl(options: {
    sessionId: string;
    fileName: string;
    contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
    const { sessionId, fileName, contentType } = options;
    const bucket = storage().bucket();

    // Construct path: user-uploads/{sessionId}/{timestamp}-{fileName}
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `user-uploads/${sessionId}/${timestamp}-${cleanFileName}`;
    const file = bucket.file(storagePath);

    // Generate Signed URL for PUT
    const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    });

    // Public URL (requires storage to be public or Token - sticking to public pattern for now)
    // Alternatively we could generate a Read Signed URL here too if needed.
    // For now, let's generate a long-lived Read Signed URL for the backend to use.
    const [readUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
        uploadUrl,
        publicUrl: readUrl
    };
}
