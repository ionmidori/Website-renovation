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

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Test');
                results.push({ model: modelName, status: '✅ Disponibile' });
                console.log(`✅ ${modelName} - OK`);
            } catch (error: any) {
                results.push({
                    model: modelName,
                    status: '❌ Non disponibile',
                    error: error.message
                });
                console.log(`❌ ${modelName} - ${error.message}`);
            }
        }

        return Response.json({
            message: 'Test completato',
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
