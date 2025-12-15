import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'API key mancante' }, { status: 500 });
    }

    try {
        console.log('📋 Recuperando lista modelli disponibili...');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Prova alcuni modelli comuni
        const modelsToTest = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
        ];

        const results = [];

        // TEST SPECIFICO PER VIDEO/CHAT
        const modelName = 'gemini-2.5-flash';
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: "Sei un test."
            });
            const result = await model.generateContent('Ciao, funzioni?');
            const response = await result.response;
            results.push({
                model: modelName,
                status: '✅ FUNZIONA (Chat + SystemInstruction)',
                response: response.text().substring(0, 50)
            });
        } catch (error: any) {
            results.push({
                model: modelName,
                status: '❌ ERRORE CHAT',
                error: error.message,
                details: error.toString()
            });
        }

        // Test fallback su 1.5
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            await model.generateContent('Test');
            results.push({ model: 'gemini-1.5-flash', status: '✅ Disponibile (Fallback)' });
        } catch (e) { }

        const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING';

        return Response.json({
            message: 'Test completato',
            debug: {
                maskedKey: maskedKey,
                keyLength: apiKey?.length || 0,
                timestamp: new Date().toISOString()
            },
            models: results
        });

    } catch (error: any) {
        console.error('❌ ERRORE:', error);
        return Response.json({
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    }
}
