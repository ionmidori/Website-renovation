import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'API Key mancante' }, { status: 500 });
    }

    try {
        // Fetch raw list of models from API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Filter for relevant models for clarity
        const relevantModels = data.models?.filter((m: any) =>
            m.name.includes('gemini') || m.name.includes('imagen')
        ) || [];

        return Response.json({
            count: relevantModels.length,
            models: relevantModels, // Show full details (supportedGenerationMethods, etc.)
            raw: data // Backup
        });

    } catch (error: any) {
        return Response.json({
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
