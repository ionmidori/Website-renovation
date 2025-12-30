import { GoogleAuth } from 'google-auth-library';

/**
 * Generate interior design image using Imagen 3 via REST API
 * Using REST API instead of SDK for better compatibility with service accounts
 */
export async function generateInteriorImage(options: {
    prompt: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    numberOfImages?: number;
}): Promise<Buffer> {
    const {
        prompt,
        aspectRatio = '16:9',
        numberOfImages = 1,
    } = options;

    console.log('[Imagen REST] Starting image generation...');
    console.log('[Imagen REST] Prompt:', prompt.substring(0, 100) + '...');

    const startTime = Date.now();

    try {
        // Read service account credentials
        const fs = require('fs');
        const path = require('path');
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        // Initialize Google Auth with service account
        const auth = new GoogleAuth({
            keyFile: serviceAccountPath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token');
        }

        console.log('[Imagen REST] Got access token');
        console.log('[Imagen REST] Project:', serviceAccount.project_id);

        // Imagen 3 REST API endpoint
        const projectId = serviceAccount.project_id;
        const location = 'us-central1';
        const model = 'imagegeneration@006'; // Imagen 3

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

        // API request payload
        const requestPayload = {
            instances: [
                {
                    prompt: prompt,
                }
            ],
            parameters: {
                sampleCount: numberOfImages,
                aspectRatio: aspectRatio,
                safetySetting: 'block_some',
                personGeneration: 'allow_adult',
            }
        };

        console.log('[Imagen REST] Calling API...');

        // Make REST API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Imagen REST] API Error:', response.status, errorText);
            throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('[Imagen REST] API Response received');

        // Extract base64 image from response
        if (!result.predictions || result.predictions.length === 0) {
            throw new Error('No image generated');
        }

        // Imagen returns base64 encoded image in predictions[0].bytesBase64Encoded
        const base64Image = result.predictions[0].bytesBase64Encoded;

        if (!base64Image) {
            console.error('[Imagen REST] Response structure:', JSON.stringify(result, null, 2));
            throw new Error('No image data in response');
        }

        // Convert base64 to Buffer
        const imageBuffer = Buffer.from(base64Image, 'base64');

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Imagen REST] Image generated in ${elapsedTime}s`);
        console.log(`[Imagen REST] Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

        return imageBuffer;

    } catch (error) {
        console.error('[Imagen REST] Error:', error);

        if (error instanceof Error) {
            if (error.message.includes('403')) {
                throw new Error('Vertex AI API not enabled or service account lacks permissions. Enable at: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com');
            }

            if (error.message.includes('404')) {
                throw new Error('Imagen model not found. Ensure you\'re using a supported region (us-central1)');
            }
        }

        throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Enhanced prompt generator for interior design
 */
export function buildInteriorDesignPrompt(options: {
    userPrompt: string;
    roomType: string;
    style: string;
}): string {
    const { userPrompt, roomType, style } = options;

    const enhancedPrompt = `
Photorealistic interior design rendering of a ${roomType}.
Style: ${style}.
${userPrompt}

Professional architectural visualization quality with natural lighting, realistic materials and textures, proper perspective, modern high-end interior design, clean composition, 4K quality.
    `.trim();

    return enhancedPrompt;
}
