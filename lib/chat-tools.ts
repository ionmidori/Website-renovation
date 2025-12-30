// Tool definitions for chat API
import { tool } from 'ai';
import { z } from 'zod';
import { storage } from '@/lib/firebase-admin';
import { saveLead } from '@/lib/db/leads';
import { generateInteriorImage, buildInteriorDesignPrompt } from '@/lib/imagen/generate-interior';

// Factory function to create tools with injected sessionId
export function createChatTools(sessionId: string) {

    // Define schemas first
    const GenerateRenderParameters = z.object({
        prompt: z.string().max(1000).describe('Detailed description of the interior design to generate'),
        roomType: z.string().max(100).describe('Type of room (e.g., living room, kitchen, bedroom)'),
        style: z.string().max(100).describe('Design style (e.g., modern, industrial, minimalist)'),
    });

    const SubmitLeadParameters = z.object({
        name: z.string().max(100).describe('Customer name'),
        email: z.string().email().max(200).describe('Customer email'),
        phone: z.string().max(20).optional().describe('Customer phone number'),
        projectDetails: z.string().max(2000).describe('Detailed project description'),
        roomType: z.string().max(100).optional().describe('Type of room'),
        style: z.string().max(100).optional().describe('Preferred style'),
    });

    return {
        generate_render: tool({
            description: `Generate a photorealistic 3D rendering of an interior design.
            
            IMPORTANT CONFIRMATION RULE:
            DO NOT call without confirmation! First summarize collected details and ask: "Vuoi che proceda con la generazione?"`,
            parameters: GenerateRenderParameters,
            execute: async (args: z.infer<typeof GenerateRenderParameters>) => {
                const { prompt, roomType, style } = args || {}; // Handle potential null args
                try {
                    // Use sessionId from closure (injected via factory)
                    const safeRoomType = (roomType || 'stanza').substring(0, 100);
                    const safeStyle = (style || 'moderno').substring(0, 100);
                    const safePrompt = (prompt || `Rendering di ${safeRoomType} in stile ${safeStyle}`);

                    console.log('[generate_render] Tool called with:', { prompt: safePrompt, roomType: safeRoomType, style: safeStyle, sessionId });
                    console.log('[generate_render] Calling Imagen REST API...');

                    // Build enhanced prompt
                    const enhancedPrompt = buildInteriorDesignPrompt({
                        userPrompt: safePrompt,
                        roomType: safeRoomType,
                        style: safeStyle,
                    });

                    // Generate image
                    const imageBuffer = await generateInteriorImage({
                        prompt: enhancedPrompt,
                        aspectRatio: '16:9',
                    });

                    // Upload to Firebase Storage with session-scoped path
                    const { storage } = await import('@/lib/firebase-admin');
                    const bucket = storage().bucket();

                    // CRITICAL: Use sessionId in filename to avoid race conditions
                    const timestamp = Date.now();
                    const fileName = `renders/${sessionId}/${timestamp}-${safeRoomType.replace(/\s+/g, '-')}.png`;
                    const file = bucket.file(fileName);

                    await file.save(imageBuffer, {
                        contentType: 'image/png',
                        metadata: {
                            cacheControl: 'public, max-age=31536000',
                        },
                    });

                    // Make file publicly accessible
                    await file.makePublic();

                    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    console.log('[generate_render] ✅ Image uploaded:', imageUrl);

                    // Return URL directly - Gemini will receive this and include it in response
                    return {
                        status: 'success',
                        imageUrl,
                        description: `Rendering ${safeStyle} per ${safeRoomType}`,
                        promptUsed: enhancedPrompt
                    };
                } catch (error) {
                    console.error('[generate_render] Error:', error);
                    return {
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Image generation failed'
                    };
                }
            },
        }),

        submit_lead_data: tool({
            description: 'Submit collected lead data (contact information and project details) to Firestore',
            parameters: SubmitLeadParameters,
            execute: async (data: z.infer<typeof SubmitLeadParameters>) => {
                try {
                    console.log('[submit_lead_data] Saving lead to Firestore:', data);

                    const { db } = await import('@/lib/firebase-admin');
                    const firestore = db();

                    await firestore.collection('leads').add({
                        ...data,
                        createdAt: new Date().toISOString(),
                        source: 'chatbot',
                        status: 'new'
                    });

                    console.log('[submit_lead_data] ✅ Lead saved successfully');


                    return {
                        success: true,
                        message: 'Dati salvati con successo! Ti contatteremo presto.'
                    };
                } catch (error) {
                    console.error('[submit_lead_data] Error:', error);
                    return {
                        success: false,
                        message: 'Errore nel salvataggio dei dati.'
                    };
                }
            }
        })
    };
}
