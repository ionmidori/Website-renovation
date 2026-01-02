
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 1x1 Red Pixel Base64
const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testImagen3DeepDive() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
        console.error("❌ Missing credentials");
        return;
    }

    const auth = new GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey, project_id: projectId },
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken.token;
    const location = 'us-central1';

    console.log(`🚀 Starting Imagen 3 Deep Dive on Project: ${projectId}`);

    // --- TEST SUITE ---

    const tests = [
        {
            name: "Test 1: Imagen 3 Capability (Auto Mask)",
            model: "imagen-3.0-capability-001",
            payload: {
                instances: [{
                    prompt: "Change color to blue",
                    image: { bytesBase64Encoded: dummyBase64 }
                }],
                parameters: {
                    editConfig: { editMode: 'inpainting-insert', maskMode: 'auto' },
                    sampleCount: 1
                }
            }
        },
        {
            name: "Test 2: Imagen 3 Capability (No Edit Config - Pure Gen?)",
            model: "imagen-3.0-capability-001",
            payload: {
                instances: [{
                    prompt: "A blue room",
                    image: { bytesBase64Encoded: dummyBase64 }
                }],
                parameters: { sampleCount: 1 }
            }
        },
        {
            name: "Test 3: Imagen 3 Generate (Standard I2I)",
            model: "imagen-3.0-generate-001",
            payload: {
                instances: [{
                    prompt: "A blue room",
                    image: { bytesBase64Encoded: dummyBase64 }
                }],
                parameters: { sampleCount: 1 }
            }
        },
        {
            name: "Test 4: Imagen 3 Generate (With Edit Config?)",
            model: "imagen-3.0-generate-001",
            payload: {
                instances: [{
                    prompt: "A blue room",
                    image: { bytesBase64Encoded: dummyBase64 }
                }],
                parameters: {
                    editConfig: { editMode: 'inpainting-insert' },
                    sampleCount: 1
                }
            }
        }
    ];

    for (const test of tests) {
        console.log(`\n🧪 ${test.name}`);
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${test.model}:predict`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.payload)
            });

            if (response.ok) {
                console.log(`✅ SUCCESS (200 OK)`);
                const data = await response.json();
                console.log(`   Generated predictions: ${data.predictions?.length || 0}`);
            } else {
                const text = await response.text();
                // Parse error to conform to specific format
                try {
                    const errJson = JSON.parse(text);
                    console.log(`❌ FAILED (${response.status}): ${errJson.error?.message || text}`);
                } catch {
                    console.log(`❌ FAILED (${response.status}): ${text.substring(0, 200)}`);
                }
            }
        } catch (err: any) {
            console.error(`💥 NETWORK ERROR: ${err.message}`);
        }
    }
}

testImagen3DeepDive();
