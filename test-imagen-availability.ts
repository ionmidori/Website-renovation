
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testModels() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const auth = new GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
            project_id: projectId,
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken.token;

    console.log(`✅ Authenticated as ${clientEmail}`);
    console.log(`ℹ️ Testing models in project: ${projectId}\n`);

    const modelsToTest = [
        'imagen-3.0-capability-001',
        'imagen-3.0-generate-001',
        'imagegeneration@006',
        'imagegeneration@005'
    ];

    const location = 'us-central1';

    for (const model of modelsToTest) {
        console.log(`Testing model: ${model}...`);
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

        // Minimal payload - trying to provoke a validation error (400) instead of Auth error (403/404)
        // If we get 400, model exists. If 404, model doesn't exist. If 403, we lack permission.
        const payload = {
            instances: [{ prompt: "test" }],
            parameters: { sampleCount: 1 }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const status = response.status;
            const text = await response.text();

            if (status === 200) {
                console.log(`✅ [${model}] AVAILABLE (200 OK)`);
            } else if (status === 400) {
                // 400 means "Bad Request" -> Model endpoint was reached but payload was wrong (which is good!)
                console.log(`✅ [${model}] AVAILABLE (400 - Endpoint reachable)`);
                // console.log(`   (Details: ${text.substring(0, 100)}...)`);
            } else if (status === 403) {
                console.log(`❌ [${model}] PERMISSION DENIED (403)`);
            } else if (status === 404) {
                console.log(`❌ [${model}] NOT FOUND (404)`);
            } else {
                console.log(`⚠️ [${model}] STATUS ${status}`);
                console.log(`   ${text.substring(0, 150)}`);
            }

        } catch (err: any) {
            console.error(`❌ [${model}] NETWORK ERROR: ${err.message}`);
        }
        console.log('---');
    }
}

testModels().catch(console.error);
