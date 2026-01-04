module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/ai_core/src/vision/analyze-room.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeRoomStructure",
    ()=>analyzeRoomStructure
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
async function analyzeRoomStructure(imageUrl) {
    const startTime = Date.now();
    console.log('[Vision] Initializing Gemini Vision analysis...');
    console.log('[Vision] Image URL:', imageUrl);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](apiKey);
    // Configurable model with fallback
    const modelVersion = process.env.VISION_MODEL_VERSION || 'gemini-3-pro-image-preview';
    const model = genAI.getGenerativeModel({
        model: modelVersion
    });
    // Structured analysis prompt
    const analysisPrompt = `You are a professional interior designer and architect. Analyze this interior photo and extract precise structural and architectural information.

Return ONLY a valid JSON object with this EXACT structure (no markdown, no explanation):

{
    "room_type": "living_room|bedroom|kitchen|bathroom|dining_room|office",
    "approximate_size_sqm": 25,
    "architectural_features": [
        "wooden staircase on left wall corner",
        "stone-clad fireplace centered on back wall",
        "slanted ceiling with exposed beams"
    ],
    "flooring_type": "terracotta tiles|hardwood|marble|carpet|concrete|laminate",
    "wall_color": "white|beige|gray|cream|...",
    "ceiling_type": "flat|sloped|vaulted|exposed_beams",
    "windows": [
        {"position": "right wall center", "size": "large|medium|small"}
    ],
    "doors": [
        {"position": "back wall left"}
    ],
    "special_features": ["fireplace", "staircase", "built-in_shelving", "exposed_brick"]
}

CRITICAL RULES:
1. Be EXTREMELY precise about positions: use "left wall", "right wall", "center", "back wall", "corner"
2. Include ALL visible architectural elements
3. Be specific about materials (e.g., "terracotta tiles" not just "tiles")
4. Return ONLY the JSON object, nothing else
5. Ensure the JSON is valid and parseable`;
    try {
        // Fetch image and convert to base64
        console.log('[Vision] Fetching and converting image...');
        const { data: imageData, mimeType } = await fetchImageAsBase64(imageUrl);
        const imagePart = {
            inlineData: {
                data: imageData,
                mimeType: mimeType
            }
        };
        const TIMEOUT_MS = 30000; // 30 seconds timeout
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>reject(new Error('Vision API request timed out')), TIMEOUT_MS));
        console.log('[Vision] Sending request to Gemini Vision API...');
        // Race between API call and timeout
        const result = await Promise.race([
            model.generateContent([
                analysisPrompt,
                imagePart
            ]),
            timeoutPromise
        ]); // Cast to any because Promise.race returns the first resolved type
        const responseText = result.response.text();
        console.log('[Vision] Raw response:', responseText.substring(0, 200) + '...');
        // Extract JSON from response (handle potential markdown wrapping)
        let jsonText = responseText.trim();
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        // Find JSON object in response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[Vision] Failed to extract JSON from response:', responseText);
            throw new Error('Failed to parse room analysis - no JSON found in response');
        }
        let analysis;
        try {
            analysis = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('[Vision] JSON Parse Error:', parseError);
            throw new Error('Failed to parse (syntax error) in Vision API response');
        }
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Vision] ✅ Analysis complete in ${elapsedTime}s`);
        console.log('[Vision] Analyzed room:', JSON.stringify(analysis, null, 2));
        // Validation - Robust check of all required fields
        if (typeof analysis.room_type !== 'string' || typeof analysis.approximate_size_sqm !== 'number' || !Array.isArray(analysis.architectural_features) || typeof analysis.flooring_type !== 'string' || typeof analysis.wall_color !== 'string' || typeof analysis.ceiling_type !== 'string' || !Array.isArray(analysis.windows) || !Array.isArray(analysis.doors)) {
            console.error('[Vision] Validation Failed. Received:', analysis);
            throw new Error('Invalid analysis result - missing required fields or incorrect types');
        }
        return analysis;
    } catch (error) {
        console.error('[Vision] Error during analysis:', error);
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                throw new Error('Gemini API authentication failed. Check GEMINI_API_KEY.');
            }
            if (error.message.includes('quota')) {
                throw new Error('Gemini API quota exceeded. Try again later.');
            }
        }
        throw error;
    }
}
/**
 * Fetch image from URL and convert to base64 with MIME type detection
 * @param url - Public HTTPS URL of the image
 * @returns Object containing base64 data and mimeType
 */ async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        console.log(`[Vision] Image fetched: ${(buffer.length / 1024).toFixed(2)} KB, Type: ${mimeType}`);
        return {
            data: base64,
            mimeType
        };
    } catch (error) {
        console.error('[Vision] Error fetching image:', error);
        throw new Error(`Failed to fetch image from URL: ${url}`);
    }
}
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/ai_core/src/imagen/generate-interior.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildInteriorDesignPrompt",
    ()=>buildInteriorDesignPrompt,
    "generateInteriorImage",
    ()=>generateInteriorImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/google-auth-library/build/src/index.js [app-route] (ecmascript)");
;
async function generateInteriorImage(options) {
    const { prompt, aspectRatio = '16:9', numberOfImages = 1 } = options;
    console.log('[Imagen REST] Starting image generation...');
    console.log('[Imagen REST] Prompt:', prompt.substring(0, 100) + '...');
    const startTime = Date.now();
    try {
        // Initialize Google Auth with environment variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID;
        if (!privateKey || !clientEmail || !projectId) {
            throw new Error('Missing Firebase credentials in environment variables');
        }
        const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleAuth"]({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
                project_id: projectId
            },
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        if (!accessToken.token) {
            throw new Error('Failed to get access token');
        }
        console.log('[Imagen REST] Got access token');
        console.log('[Imagen REST] Project:', projectId);
        // ✅ BUG FIX #8: Configurable Imagen model version
        const location = 'us-central1';
        const model = process.env.IMAGEN_MODEL_VERSION || 'imagen-4.0-generate-001';
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
        // API request payload
        const requestPayload = {
            instances: [
                {
                    prompt: prompt
                }
            ],
            parameters: {
                sampleCount: numberOfImages,
                aspectRatio: aspectRatio,
                safetySetting: 'block_some',
                personGeneration: 'allow_adult'
            }
        };
        console.log('[Imagen REST] Calling API...');
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 60000); // 60s timeout
        // Make REST API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal
        });
        clearTimeout(timeoutId); // Clear timeout on success
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
        // ✅ BUG FIX #10: User-friendly error messages (don't expose internal details)
        if (error instanceof Error) {
            // Log detailed error for debugging
            console.error('[Imagen REST] Detailed error:', error.message, error.stack);
            if (error.message.includes('403')) {
                throw new Error('Image generation service is currently unavailable. Please try again later.');
            }
            if (error.message.includes('404')) {
                throw new Error('Image generation service is currently unavailable. Please try again later.');
            }
            if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
                throw new Error('Image generation timed out. Please try again.');
            }
        }
        // Generic user-friendly message
        throw new Error('Image generation failed. Please try again in a few moments.');
    }
}
function buildInteriorDesignPrompt(options) {
    const { userPrompt, roomType, style } = options;
    const enhancedPrompt = `
Photorealistic interior design rendering of a ${roomType}.
Style: ${style}.
${userPrompt}

Professional architectural visualization quality with natural lighting, realistic materials and textures, proper perspective, modern high-end interior design, clean composition, 4K quality.
    `.trim();
    return enhancedPrompt;
}
}),
"[project]/ai_core/src/imagen/prompt-builders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildFallbackPrompt",
    ()=>buildFallbackPrompt,
    "buildPromptFromRoomAnalysis",
    ()=>buildPromptFromRoomAnalysis
]);
function buildPromptFromRoomAnalysis(analysis, targetStyle, userRequest) {
    console.log('[Prompt Builder] Building detailed T2I prompt from analysis...');
    // Helper for formatting lists
    const formatList = (items, formatter, emptyText = '')=>items && items.length > 0 ? items.map(formatter).join('\n') : emptyText;
    // Format architectural features
    const features = formatList(analysis.architectural_features, (f)=>`- ${f}`);
    // Format windows
    const windowsDescription = formatList(analysis.windows, (w)=>`- ${w.size} window on ${w.position}`, '- No visible windows');
    // Format doors
    const doorsDescription = formatList(analysis.doors, (d)=>`- Door on ${d.position}`);
    // Format special features
    const specialFeaturesList = formatList(analysis.special_features, (f)=>`- ${f}`);
    const specialFeatures = specialFeaturesList ? `\nSpecial architectural elements:\n${specialFeaturesList}` : '';
    // Build comprehensive prompt
    const detailedPrompt = `
Professional architectural photography of a ${analysis.room_type}, approximately ${analysis.approximate_size_sqm} square meters.

ARCHITECTURAL LAYOUT (MUST PRESERVE EXACTLY):
${features}

Windows:
${windowsDescription}

${doorsDescription ? `Doors:\n${doorsDescription}\n` : ''}
Flooring: ${analysis.flooring_type}
Walls: ${analysis.wall_color}
Ceiling: ${analysis.ceiling_type}${specialFeatures}

DESIGN TRANSFORMATION:
Style: ${targetStyle}
User request: ${userRequest}

STRICT REQUIREMENTS:
- Preserve the EXACT architectural layout described above
- Keep all structural elements in their specified positions
- Maintain the same room dimensions and proportions
- Change ONLY: furniture, decorative elements, material textures, colors, lighting fixtures
- Do NOT move or alter: windows, doors, stairs, fireplace, built-in features
- Quality: Photorealistic, 8K resolution, architectural magazine quality
- Lighting: Natural sunlight through windows + ambient interior lighting
- Style: High-end professional interior design
- Perspective: Proper architectural perspective, sharp focus throughout
- Rendering: Physically based rendering, ray-traced reflections, realistic materials
    `.trim();
    console.log('[Prompt Builder] Generated prompt length:', detailedPrompt.length, 'characters');
    // Log a preview
    const preview = detailedPrompt.substring(0, 200) + '...';
    console.log('[Prompt Builder] Preview:', preview);
    return detailedPrompt;
}
function buildFallbackPrompt(roomType, style, userRequest) {
    return `
Professional ${style} style ${roomType}.
${userRequest}
Photorealistic, 8K, architectural photography, high-end interior design, natural lighting.
    `.trim();
}
}),
"[project]/ai_core/src/imagen/generate-interior-i2i.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildI2IEditingPrompt",
    ()=>buildI2IEditingPrompt,
    "generateInteriorImageI2I",
    ()=>generateInteriorImageI2I
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/google-auth-library/build/src/index.js [app-route] (ecmascript)");
;
async function generateInteriorImageI2I(options) {
    const { prompt, referenceImage, mode = 'inpainting-insert', maskMode = 'auto', aspectRatio = '16:9', numberOfImages = 1, modificationType = 'renovation' } = options;
    console.log('[Imagen I2I] Starting image-to-image editing...');
    console.log('[Imagen I2I] Modification Type:', modificationType);
    console.log('[Imagen I2I] Prompt:', prompt.substring(0, 100) + '...');
    const startTime = Date.now();
    try {
        // Initialize Google Auth with environment variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.FIREBASE_PROJECT_ID;
        if (!privateKey || !clientEmail || !projectId) {
            throw new Error('Missing Firebase credentials in environment variables');
        }
        const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleAuth"]({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
                project_id: projectId
            },
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        if (!accessToken.token) {
            throw new Error('Failed to get access token');
        }
        console.log('[Imagen I2I] Got access token');
        console.log('[Imagen I2I] Project:', projectId);
        // SELECT MODEL BASED ON MODIFICATION TYPE
        const location = 'us-central1';
        let model = process.env.IMAGEN_I2I_MODEL || 'imagegeneration@006'; // Default General
        if (modificationType === 'detail') {
            // Use Capability model for detail editing
            model = process.env.IMAGEN_CAPABILITY_MODEL || 'imagen-3.0-capability-001';
            console.log('[Imagen I2I] DETAIL mode selected -> Switching to Capability model');
        } else {
            // Use Generate model for general renovation
            console.log('[Imagen I2I] RENOVATION mode selected -> Using General model');
        }
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
        console.log('[Imagen I2I] Using model:', model);
        // API request payload for image-to-image editing
        // Convert HTTPS URL to GS URI if possible (preferred by Vertex AI)
        let imageUri = referenceImage;
        if (referenceImage.startsWith('https://storage.googleapis.com/')) {
            // Format: https://storage.googleapis.com/BUCKET_NAME/PATH
            const pathParts = referenceImage.replace('https://storage.googleapis.com/', '').split('/');
            const bucket = pathParts.shift();
            const path = pathParts.join('/');
            if (bucket && path) {
                imageUri = `gs://${bucket}/${path}`;
                console.log('[Imagen I2I] Converted URL to GS URI:', imageUri);
            }
        }
        const isCapabilityModel = model.includes('capability');
        const isImagen3Generate = model.includes('imagen-3.0-generate');
        // ✅ QUALITY WRAPPER: Hardcoded parameters for maximum quality
        const parameters = {
            sampleCount: numberOfImages,
            // aspectRatio is not supported in I2I mode for some models (inherit from source)
            safetySetting: 'block_some',
            personGeneration: 'allow_adult',
            // ✅ NEW: Negative prompt to prevent distortions and artifacts
            negativePrompt: 'blurry, distorted, low resolution, cartoon, painting, melted objects, ' + 'bad perspective, floating structures, noise, ugly, deformed, watermark, ' + 'text overlay, amateur, sketch, low quality, pixelated'
        };
        // Strict Payload Logic based on Model Type
        if (isCapabilityModel) {
            // Capability models (editing) require editConfig
            parameters.editConfig = {
                editMode: mode,
                maskMode: maskMode
            };
        } else if (isImagen3Generate) {
            // Imagen 3 Generate (Standard I2I) - STRICTLY NO editConfig
            console.log('[Imagen I2I] Imagen 3 Generate detected - Using CLEAN payload with negative prompt');
        } else {
            // Legacy/Standard models (Imagen 2) - Standard payload
            console.log('[Imagen I2I] Legacy/Standard Model detected - skipping editConfig');
        }
        const requestPayload = {
            instances: [
                {
                    prompt: prompt,
                    image: {
                        gcsUri: imageUri
                    }
                }
            ],
            parameters: parameters
        };
        // ✅ LOGGING FOR USER DEBUGGING (Excluding large image data if present)
        console.log('--- [DEBUG] IMAGEN API PAYLOAD ---');
        console.log('Model:', model);
        console.log('Endpoint:', endpoint);
        console.log('Payload:', JSON.stringify({
            instances: requestPayload.instances.map((inst)=>({
                    ...inst,
                    // Truncate image data if it were base64 for cleaner logs
                    image: inst.image?.gcsUri ? inst.image : '{base64_data_hidden}'
                })),
            parameters: requestPayload.parameters
        }, null, 2));
        console.log('--- [DEBUG] END PAYLOAD ---');
        console.log('[Imagen I2I] Calling API with editMode:', mode, 'maskMode:', maskMode);
        // Make REST API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Imagen I2I] API Error:', response.status, errorText);
            // Check if it's a 404/403 (model not available) and suggest fallback
            if (response.status === 404 || response.status === 403) {
                console.warn('[Imagen I2I] Capability model not available, trying fallback...');
                // Try fallback to Imagen 2.0 if available
                if (process.env.I2I_FALLBACK_MODEL) {
                    console.log('[Imagen I2I] Attempting fallback to:', process.env.I2I_FALLBACK_MODEL);
                    // Note: Fallback model requires manual configuration in environment variables
                    return await generateInteriorImageI2I({
                        ...options
                    });
                }
                throw new Error('Image editing is not available for your account. Please contact support.');
            }
            // Expose the real error for debugging
            throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log('[Imagen I2I] API Response received');
        // Extract base64 image from response
        if (!result.predictions || result.predictions.length === 0) {
            throw new Error('No image generated');
        }
        // Imagen returns base64 encoded image in predictions[0].bytesBase64Encoded
        const base64Image = result.predictions[0].bytesBase64Encoded;
        if (!base64Image) {
            console.error('[Imagen I2I] Response structure:', JSON.stringify(result, null, 2));
            throw new Error('No image data in response');
        }
        // Convert base64 to Buffer
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Imagen I2I] Image edited in ${elapsedTime}s`);
        console.log(`[Imagen I2I] Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
        return imageBuffer;
    } catch (error) {
        console.error('[Imagen I2I] Error:', error);
        // User-friendly error messages (don't expose internal details)
        if (error instanceof Error) {
            // Log detailed error for debugging
            console.error('[Imagen I2I] Detailed error:', error.message, error.stack);
            if (error.message.includes('403')) {
                throw new Error('Image editing service is currently unavailable. Please try again later.');
            }
            if (error.message.includes('404')) {
                throw new Error('Image editing service is currently unavailable. Please try again later.');
            }
            // Allow API errors to propagate for debugging
            if (error.message.includes('Imagen API error')) {
                throw error;
            }
        }
        // Generic user-friendly message
        throw new Error('Image editing failed. Please try again in a few moments.');
    }
}
function buildI2IEditingPrompt(options) {
    const { userPrompt, structuralElements, roomType, style } = options;
    // ✅ MANDATORY STYLE BOOSTER: Injected into every prompt for max quality
    const STYLE_BOOSTER = ', photorealistic 8k, highly detailed, architectural photography, ' + 'sharp focus, raytracing lighting, physically based rendering, ' + 'professional interior design portfolio';
    // If we have structural elements, emphasize preservation
    const structuralInstruction = structuralElements ? `STRICTLY PRESERVE THE ARCHITECTURAL STRUCTURE AND LAYOUT: ${structuralElements}. ` : '';
    // ✅ QUALITY WRAPPER: Every prompt gets the booster appended
    const enhancedPrompt = `
${structuralInstruction}
Task: Professional total renovation of this ${roomType} into a high-end ${style} design.
User request: ${userPrompt}

Instructions:
- Keep the exact position of windows, doors, and walls.
- Replace all materials, textures, and furniture with premium ${style} alternatives.
- Use realistic lighting (natural sunlight through windows + interior ambient lighting).
- Quality requirements: ${STYLE_BOOSTER}
    `.trim();
    console.log('[I2I Prompt] Style Booster injected:', STYLE_BOOSTER);
    return enhancedPrompt;
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/ai_core/src/chat-tools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Tool definitions for chat API
__turbopack_context__.s([
    "createChatTools",
    ()=>createChatTools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/provider-utils/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/generate-interior.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2d$i2i$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/generate-interior-i2i.ts [app-route] (ecmascript)");
// ✅ VISION + T2I: Static imports (no I2I fallback needed)
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$vision$2f$analyze$2d$room$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/vision/analyze-room.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
;
;
;
;
;
function createChatTools(sessionId) {
    // Define schemas first - ✅ CHAIN OF THOUGHT: Forza l'AI a riflettere sulla struttura prima del prompt
    const GenerateRenderParameters = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        // 1️⃣ STEP 1: Analizza la struttura (Chain of Thought)
        structuralElements: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(20).describe('MANDATORY: List ALL structural elements visible in the user photo or mentioned in the request (in ENGLISH). ' + 'Examples: "arched window on left wall", "exposed wooden ceiling beams", "parquet flooring", "high ceilings 3.5m". ' + 'If no photo was uploaded, describe the structural requests from the conversation (e.g., "large kitchen island", "walk-in shower").'),
        // 2️⃣ STEP 2: Type & Style (già esistenti)
        roomType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3).describe('MANDATORY: Type of room in ENGLISH (e.g. "kitchen", "bathroom").'),
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3).describe('MANDATORY: Design style in ENGLISH (e.g. "industrial", "modern").'),
        // 3️⃣ STEP 3: Prompt finale (DEVE usare structuralElements)
        prompt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(30).describe('MANDATORY: The final detailed prompt for the image generator IN ENGLISH. ' + 'MUST start by describing the structuralElements listed above. ' + 'Example: "A modern living room featuring a large arched window on the left wall, exposed wooden beams on the ceiling, and oak parquet flooring. The space includes..."'),
        // 🆕 HYBRID TOOL PARAMETERS (Optional - backward compatible)
        // 4️⃣ Mode selection (creation vs modification)
        mode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'creation',
            'modification'
        ]).optional().default('creation').describe('Choose "modification" if user uploaded a photo and wants to transform that specific room. ' + 'Choose "creation" if user is describing an imaginary room from scratch. ' + 'DEFAULT: "creation" if not specified.'),
        // 5️⃣ Source image URL (required for modification mode)
        sourceImageUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional().describe('REQUIRED if mode="modification". The public HTTPS URL of the uploaded user photo (from Firebase Storage). ' + 'Search conversation history for URLs like "https://storage.googleapis.com/...". ' + 'If user uploaded a photo but you cannot find the URL, ask them to re-upload. ' + 'Leave empty for mode="creation".'),
        // 6️⃣ Modification Type (for model selection)
        modificationType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'renovation',
            'detail'
        ]).optional().default('renovation').describe('Choose "renovation" for whole-room transformation (default). ' + 'Choose "detail" for small edits (e.g., "change sofa color", "add plant"). ' + 'This selects the appropriate AI model.')
    });
    const SubmitLeadParameters = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).describe('Customer name'),
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().max(200).describe('Customer email'),
        phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional().describe('Customer phone number'),
        projectDetails: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000).describe('Detailed project description'),
        roomType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional().describe('Type of room'),
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional().describe('Preferred style')
    });
    return {
        generate_render: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])({
            description: `Generate a photorealistic 3D rendering of an interior design.
            
            IMPORTANT CONFIRMATION RULE:
            DO NOT call without confirmation! First summarize collected details and ask: "Vuoi che proceda con la generazione?"
            
            CRITICAL - AFTER THIS TOOL RETURNS:
            You MUST include the returned imageUrl in your next response using markdown format.
            Example: "Ecco il rendering!\\n\\n![](RETURNED_IMAGE_URL)\\n\\nTi piace?"
            
            The imageUrl will be in the tool result under result.imageUrl - you MUST display it with ![](url) syntax.`,
            parameters: GenerateRenderParameters,
            execute: async (args)=>{
                // Extract all parameters including new hybrid parameters
                const { prompt, roomType, style, structuralElements, mode, sourceImageUrl, modificationType } = args || {};
                try {
                    // Use sessionId from closure (injected via factory)
                    console.log('🏗️ [Chain of Thought] Structural elements detected:', structuralElements);
                    console.log('🛠️ [Hybrid Tool] Mode selected:', mode || 'creation (default)');
                    console.log('🔧 [Hybrid Tool] Modification Type:', modificationType || 'renovation (default)');
                    console.log('🎨 [generate_render] RECEIVED ARGS:', {
                        prompt,
                        roomType,
                        style,
                        mode,
                        hasSourceImage: !!sourceImageUrl
                    });
                    const safeRoomType = (roomType || 'room').substring(0, 100);
                    const safeStyle = (style || 'modern').substring(0, 100);
                    // FAILSAFE: If prompt is empty/short, regenerate it
                    let safePrompt = prompt || `Interior design of a ${safeRoomType} in ${safeStyle} style`;
                    if (safePrompt.length < 10) {
                        console.warn('⚠️ [Failsafe] Short prompt detected, regenerating...');
                        safePrompt = `${safeStyle} style ${safeRoomType} with ${structuralElements || 'modern design'}`;
                    }
                    console.log('🔥 [generate_render] Safe Prompt used:', safePrompt);
                    // 🔀 ROUTING LOGIC: Choose T2I (creation) or I2I (modification)
                    let imageBuffer;
                    let enhancedPrompt;
                    const actualMode = mode || 'creation'; // Default to creation for backward compatibility
                    // 🔍 DEBUG LOGGING
                    console.log('🔍 [DEBUG] actualMode:', actualMode);
                    console.log('🔍 [DEBUG] sourceImageUrl:', sourceImageUrl);
                    console.log('🔍 [DEBUG] mode param:', mode);
                    console.log('🔍 [DEBUG] Condition met?', actualMode === 'modification' && sourceImageUrl);
                    if (actualMode === 'modification' && sourceImageUrl) {
                        try {
                            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            // 📸 PHOTO-BASED RENOVATION: Vision Analysis → T2I
                            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            console.log('[Vision] 📸 PHOTO-BASED MODE: Analyzing with Gemini Vision → T2I');
                            console.log('[Vision] Reference photo:', sourceImageUrl);
                            // Step 1: Analyze room structure with Gemini Vision
                            console.log('[Vision] Step 1: Analyzing room structure...');
                            const roomAnalysis = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$vision$2f$analyze$2d$room$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeRoomStructure"])(sourceImageUrl);
                            console.log('[Vision] ✅ Analysis complete');
                            console.log('[Vision] Detected:', roomAnalysis.room_type, `(~${roomAnalysis.approximate_size_sqm}sqm)`);
                            console.log('[Vision] Features:', roomAnalysis.architectural_features.join(', '));
                            // Step 2: Build super-detailed prompt from Vision analysis
                            // ✅ REFACTOR: Use I2I Prompt Builder directly (preserving structure)
                            enhancedPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2d$i2i$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildI2IEditingPrompt"])({
                                userPrompt: safePrompt,
                                structuralElements: roomAnalysis.architectural_features.join(', '),
                                roomType: safeRoomType,
                                style: safeStyle
                            });
                            console.log('[Vision] Step 2: Generating with I2I using Vision-guided prompt');
                            console.log('[I2I] Prompt preview:', enhancedPrompt.substring(0, 150) + '...');
                            // Step 3: Generate with Image-to-Image (I2I)
                            // ✅ REFACTOR: Passing sourceImageUrl as referenceImage
                            imageBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2d$i2i$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInteriorImageI2I"])({
                                prompt: enhancedPrompt,
                                referenceImage: sourceImageUrl,
                                mode: 'inpainting-insert',
                                aspectRatio: '16:9',
                                numberOfImages: 1,
                                modificationType: modificationType || 'renovation'
                            });
                            console.log('[I2I] ✅ Generation complete using Vision-guided I2I');
                            console.log('[T2I] ✅ Generation complete using Vision-guided T2I');
                        } catch (visionError) {
                            console.error('[Vision] ⚠️ Analysis failed, falling back to standard T2I:', visionError);
                            // FALLBACK: Use standard T2I generation
                            console.log('[Fallback] Switching to standard Text-to-Image generation...');
                            enhancedPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildInteriorDesignPrompt"])({
                                userPrompt: safePrompt,
                                roomType: safeRoomType,
                                style: safeStyle
                            });
                            imageBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInteriorImage"])({
                                prompt: enhancedPrompt,
                                aspectRatio: '16:9'
                            });
                        }
                    } else {
                        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        // ✨ TEXT-TO-IMAGE CREATION MODE (existing flow - unchanged)
                        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        console.log('[Hybrid Tool] ✨ Using TEXT-TO-IMAGE generation (creation mode)');
                        console.log('[generate_render] Calling Imagen REST API...');
                        // Build enhanced prompt (existing logic)
                        enhancedPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildInteriorDesignPrompt"])({
                            userPrompt: safePrompt,
                            roomType: safeRoomType,
                            style: safeStyle
                        });
                        // Generate image (existing flow)
                        imageBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInteriorImage"])({
                            prompt: enhancedPrompt,
                            aspectRatio: '16:9'
                        });
                    }
                    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    // 📤 UPLOAD TO FIREBASE STORAGE (common for both modes)
                    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    // ✅ BUG FIX #7: Validate image buffer before upload
                    if (!imageBuffer || imageBuffer.length === 0) {
                        throw new Error('Generated image is empty or invalid');
                    }
                    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
                    if (imageBuffer.length > maxSizeBytes) {
                        throw new Error(`Generated image is too large: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
                    }
                    console.log(`[generate_render] Image validated: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
                    // Upload to Firebase Storage with session-scoped path
                    const { storage } = await __turbopack_context__.A("[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript, async loader)");
                    const bucket = storage().bucket();
                    // ✅ BUG FIX #2: Add unique ID to prevent race conditions
                    const timestamp = Date.now();
                    const uniqueId = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID().split('-')[0]; // First segment for brevity
                    const fileName = `renders/${sessionId}/${timestamp}-${uniqueId}-${safeRoomType.replace(/\s+/g, '-')}.png`;
                    const file = bucket.file(fileName);
                    await file.save(imageBuffer, {
                        contentType: 'image/png',
                        metadata: {
                            cacheControl: 'public, max-age=31536000'
                        }
                    });
                    // Generate Signed URL (valid for 7 days)
                    // This replaces makePublic() for better security
                    const [signedUrl] = await file.getSignedUrl({
                        action: 'read',
                        expires: Date.now() + 7 * 24 * 60 * 60 * 1000
                    });
                    const imageUrl = signedUrl;
                    console.log('[generate_render] ✅ Image uploaded (secure signed URL):', imageUrl.substring(0, 50) + '...');
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
            }
        }),
        submit_lead_data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$provider$2d$utils$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["tool"])({
            description: 'Submit collected lead data (contact information and project details) to Firestore',
            parameters: SubmitLeadParameters,
            execute: async (data)=>{
                try {
                    console.log('[submit_lead_data] Saving lead to Firestore:', data);
                    const { getFirestore, Timestamp, FieldValue } = await __turbopack_context__.A("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, async loader)");
                    const { db } = await __turbopack_context__.A("[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript, async loader)");
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
}),
"[project]/ai_core/src/ai-retry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callAIWithRetry",
    ()=>callAIWithRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
;
/**
 * ✅ CRITICAL FIX #3: AI timeout and rate limit handling
 * Helper function to call AI with retry logic and timeout
 */ const MAX_RETRIES = 2;
const TIMEOUT_MS = 45000; // 45 seconds
async function callAIWithRetry(config, retries = 0) {
    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), TIMEOUT_MS);
        const streamPromise = Promise.resolve().then(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["streamText"])({
                ...config,
                abortSignal: controller.signal
            }));
        const result = await Promise.race([
            streamPromise,
            new Promise((_, reject)=>setTimeout(()=>reject(new Error('AI_TIMEOUT')), TIMEOUT_MS))
        ]);
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        // Handle timeout errors
        if (error.message === 'AI_TIMEOUT' && retries < MAX_RETRIES) {
            console.warn(`[AI] Timeout, retrying (${retries + 1}/${MAX_RETRIES})`);
            await new Promise((resolve)=>setTimeout(resolve, 1000 * (retries + 1)));
            return callAIWithRetry(config, retries + 1);
        }
        // Handle rate limit (429) errors
        if (error.status === 429 && retries < MAX_RETRIES) {
            const retryAfter = parseInt(error.headers?.['retry-after'] || '5');
            console.warn(`[AI] Rate limited, waiting ${retryAfter}s before retry`);
            await new Promise((resolve)=>setTimeout(resolve, retryAfter * 1000));
            return callAIWithRetry(config, retries + 1);
        }
        // Throw user-friendly error
        if (error.status === 429) {
            throw new Error('Il servizio è temporaneamente sovraccarico. Riprova tra qualche minuto.');
        }
        if (error.message === 'AI_TIMEOUT') {
            throw new Error('La richiesta ha impiegato troppo tempo. Riprova.');
        }
        throw error;
    }
}
;
}),
"[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("firebase-admin/app");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("firebase-admin/firestore");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/firebase-admin/storage [external] (firebase-admin/storage, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("firebase-admin/storage");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>db,
    "getFirebaseStorage",
    ()=>getFirebaseStorage,
    "getFirestoreDb",
    ()=>getFirestoreDb,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/storage [external] (firebase-admin/storage, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/**
 * Firebase Admin SDK initialization for server-side operations
 * Singleton pattern ensures single instance across serverless invocations
 * ALWAYS loads from firebase-service-account.json for reliability
 */ let firebaseApp;
let firestoreInstance;
let storageInstance;
/**
 * ✅ CRITICAL FIX #2: Validate Firebase credentials format
 * Prevents security risks from malformed credentials
 */ /**
 * ✅ CRITICAL FIX #2: Sanitize and Validate Firebase Private Key
 * Prevents security risks from malformed credentials and ensures correct format.
 * Returns the sanitized private key.
 */ function sanitizeAndValidatePrivateKey(privateKey) {
    if (!privateKey) {
        throw new Error('[Firebase] Private key is missing');
    }
    // 1. Sanitize: Handle both escaped (\n) and unescaped newlines
    let sanitizedKey = privateKey.replace(/\\n/g, '\n');
    // 2. Sanitize: Remove wrapping quotes if present (common env var issue)
    if (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"')) {
        sanitizedKey = sanitizedKey.slice(1, -1);
    }
    if (sanitizedKey.startsWith("'") && sanitizedKey.endsWith("'")) {
        sanitizedKey = sanitizedKey.slice(1, -1);
    }
    // 3. Validation: Check for standard PEM format markers
    if (!sanitizedKey.includes('BEGIN PRIVATE KEY') || !sanitizedKey.includes('END PRIVATE KEY')) {
        throw new Error('[Firebase] Invalid private key format - must be a valid RSA private key (PEM format)');
    }
    // 4. Validation: content check
    const keyContent = sanitizedKey.split('BEGIN PRIVATE KEY')[1]?.split('END PRIVATE KEY')[0];
    if (!keyContent || keyContent.trim().length < 100) {
        throw new Error('[Firebase] Private key appears to be truncated or empty');
    }
    // 5. Re-verify newlines for PEM validity
    if (!sanitizedKey.includes('\n')) {
        throw new Error('[Firebase] Private key invalid: missing newlines after sanitization');
    }
    return sanitizedKey;
}
/**
 * Validates other credential fields
 */ function validateServiceAccount(clientEmail, projectId) {
    // Validate email format
    if (!clientEmail || !clientEmail.includes('@') || !clientEmail.endsWith('.gserviceaccount.com')) {
        throw new Error(`[Firebase] Invalid service account email: ${clientEmail} - must end with .gserviceaccount.com`);
    }
    // Validate project ID format
    if (!projectId || projectId.length < 6 || !/^[a-z0-9-]+$/.test(projectId)) {
        throw new Error(`[Firebase] Invalid project ID: ${projectId} - must contain only lowercase letters, numbers, and hyphens`);
    }
}
/**
 * Initialize Firebase Admin SDK
 * Loads from environment variables (Vercel-compatible) or falls back to JSON file
 */ function initializeFirebase() {
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["getApps"])().length === 0) {
        console.log('[Firebase] Initializing Firebase Admin SDK...');
        try {
            // Try environment variables first (Vercel-compatible)
            // Try environment variables first (Vercel-compatible)
            const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (rawPrivateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
                console.log('[Firebase] Loading credentials from environment variables');
                // ✅ CRITICAL FIX #2: Sanitize & Validate
                const privateKey = sanitizeAndValidatePrivateKey(rawPrivateKey);
                validateServiceAccount(process.env.FIREBASE_CLIENT_EMAIL, process.env.FIREBASE_PROJECT_ID);
                firebaseApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["initializeApp"])({
                    credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["cert"])({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey
                    }),
                    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
                });
                console.log('[Firebase] ✅ Successfully initialized from environment variables');
                return firebaseApp;
            }
            // Fallback to JSON file (local development)
            const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
            const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
            const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
            console.log('[Firebase] Loading credentials from:', serviceAccountPath);
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Firebase service account file not found at: ${serviceAccountPath}. Please ensure firebase-service-account.json exists in the project root OR set environment variables.`);
            }
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            // ✅ CRITICAL FIX #2: Validate JSON file credentials
            const privateKey = sanitizeAndValidatePrivateKey(serviceAccount.private_key);
            validateServiceAccount(serviceAccount.client_email, serviceAccount.project_id);
            firebaseApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["initializeApp"])({
                credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["cert"])({
                    ...serviceAccount,
                    private_key: privateKey // Use sanitized key
                }),
                storageBucket: serviceAccount.project_id + '.firebasestorage.app'
            });
            console.log('[Firebase] ✅ Successfully initialized from JSON file');
            return firebaseApp; // Assert not null since we just initialized it
        } catch (error) {
            console.error('[Firebase] ❌ Initialization FAILED:', error);
            throw error;
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["getApps"])()[0];
}
function getFirestoreDb() {
    if (!firestoreInstance) {
        const app = initializeFirebase();
        firestoreInstance = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["getFirestore"])(app);
    // REMOVED: settings() call - was causing "already initialized" error
    }
    return firestoreInstance;
}
function getFirebaseStorage() {
    if (!storageInstance) {
        const app = initializeFirebase();
        storageInstance = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__["getStorage"])(app);
    }
    return storageInstance;
}
const db = getFirestoreDb;
const storage = getFirebaseStorage;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/ai_core/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COLLECTIONS",
    ()=>COLLECTIONS
]);
const COLLECTIONS = {
    USERS: 'users',
    SESSIONS: 'sessions',
    MESSAGES: 'messages',
    LEADS: 'leads'
};
}),
"[project]/ai_core/src/db/leads.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getLeads",
    ()=>getLeads,
    "saveLead",
    ()=>saveLead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function saveLead(data) {
    try {
        const firestore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
        const leadData = {
            ...data,
            createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].serverTimestamp(),
            status: 'new'
        };
        const leadRef = await firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].LEADS).add(leadData);
        console.log(`[saveLead] Lead saved with ID: ${leadRef.id}`);
        return {
            success: true,
            leadId: leadRef.id
        };
    } catch (error) {
        console.error('[saveLead] Error saving lead:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
async function getLeads(status, limit = 50) {
    try {
        const firestore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
        let query = firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].LEADS).orderBy('createdAt', 'desc').limit(limit);
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc)=>({
                ...doc.data(),
                id: doc.id
            }));
    } catch (error) {
        console.error('[getLeads] Error fetching leads:', error);
        return [];
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/ai_core/src/db/messages.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ensureSession",
    ()=>ensureSession,
    "getConversationContext",
    ()=>getConversationContext,
    "saveMessage",
    ()=>saveMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function getConversationContext(sessionId, limit = 10) {
    try {
        const firestore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
        // Query last N messages, ordered by timestamp descending
        const messagesRef = firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].SESSIONS).doc(sessionId).collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].MESSAGES).orderBy('timestamp', 'desc').limit(limit);
        const snapshot = await messagesRef.get();
        if (snapshot.empty) {
            console.log(`[getConversationContext] No messages found for session: ${sessionId}`);
            return [];
        }
        // Convert to array and reverse (oldest first for chat context)
        const messages = snapshot.docs.map((doc)=>{
            const data = doc.data();
            return {
                role: data.role,
                content: data.content,
                toolInvocations: data.toolCalls?.map((tc)=>({
                        toolCallId: crypto.randomUUID(),
                        toolName: tc.name,
                        args: tc.args,
                        state: 'result',
                        result: tc.result
                    }))
            };
        }).reverse(); // Reverse to get chronological order
        console.log(`[getConversationContext] Loaded ${messages.length} messages for session: ${sessionId}`);
        return messages;
    } catch (error) {
        console.error('[getConversationContext] Error loading context:', error);
        return [];
    }
}
async function saveMessage(sessionId, role, content, metadata) {
    try {
        const firestore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
        const messageData = {
            role,
            content,
            timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].serverTimestamp(),
            ...metadata
        };
        // Add message to subcollection
        await firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].SESSIONS).doc(sessionId).collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].MESSAGES).add(messageData);
        // Update session metadata
        await firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].SESSIONS).doc(sessionId).set({
            updatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].serverTimestamp(),
            messageCount: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].increment(1),
            lastMessagePreview: content.substring(0, 100)
        }, {
            merge: true
        });
        console.log(`[saveMessage] Saved ${role} message to session: ${sessionId}`);
    } catch (error) {
        console.error('[saveMessage] Error saving message:', error);
    // Don't throw - message save failures shouldn't break the chat
    }
}
async function ensureSession(sessionId) {
    try {
        const firestore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
        const sessionRef = firestore.collection(__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLLECTIONS"].SESSIONS).doc(sessionId);
        const session = await sessionRef.get();
        if (!session.exists) {
            await sessionRef.set({
                createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].serverTimestamp(),
                updatedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["FieldValue"].serverTimestamp(),
                messageCount: 0,
                status: 'active'
            });
            console.log(`[ensureSession] Created new session: ${sessionId}`);
        }
    } catch (error) {
        console.error('[ensureSession] Error ensuring session:', error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/ai_core/src/imagen/upload-base64-image.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Upload base64 image to Firebase Storage and return public URL
 * 
 * Required for Imagen Capability API which needs HTTP/GCS URLs instead of base64
 * This is a helper function for the hybrid tool implementation
 */ /**
 * Upload base64 encoded image to Firebase Storage
 * 
 * @param options.base64Data - Base64 data URL (e.g., data:image/jpeg;base64,...)
 * @param options.sessionId - User session ID for organizing uploads
 * @param options.prefix - Optional prefix for storage path (default: 'user-uploads')
 * @returns Public HTTPS URL to the uploaded image
 * 
 * @example
 * ```typescript
 * const url = await uploadBase64Image({
 *   base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZ...',
 *   sessionId: 'abc123',
 *   prefix: 'user-uploads'
 * });
 * // Returns: https://storage.googleapis.com/bucket-name/user-uploads/abc123/1234567890-xyz.jpeg
 * ```
 */ __turbopack_context__.s([
    "extractMimeType",
    ()=>extractMimeType,
    "isValidBase64DataUrl",
    ()=>isValidBase64DataUrl,
    "uploadBase64Image",
    ()=>uploadBase64Image
]);
async function uploadBase64Image(options) {
    const { base64Data, sessionId, prefix = 'user-uploads' } = options;
    console.log('[Upload Base64] Starting upload...');
    try {
        // 🔒 SECURITY: Validate and sanitize sessionId (prevent path traversal)
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{20,50}$/.test(sessionId)) {
            throw new Error('Invalid sessionId format');
        }
        // 1. Parse base64 data URL to extract MIME type and data
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 format. Expected: data:image/TYPE;base64,DATA');
        }
        const mimeType = matches[1]; // e.g., 'image/jpeg', 'image/png'
        const base64String = matches[2];
        console.log(`[Upload Base64] Detected MIME type: ${mimeType}`);
        // 2. Convert base64 string to Buffer
        const imageBuffer = Buffer.from(base64String, 'base64');
        // 3. Validate image size (max 10MB to match existing validation)
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (imageBuffer.length > maxSizeBytes) {
            const sizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
            throw new Error(`Image too large: ${sizeMB}MB (maximum 10MB allowed)`);
        }
        const sizeKB = (imageBuffer.length / 1024).toFixed(2);
        console.log(`[Upload Base64] Image size: ${sizeKB} KB`);
        // 4. Generate unique filename to prevent collisions
        const timestamp = Date.now();
        const uniqueId = crypto.randomUUID().split('-')[0]; // First segment for brevity
        const extension = mimeType.split('/')[1]; // Extract extension (jpeg, png, webp, etc.)
        // 🔒 SECURITY: sessionId is already validated, safe to use in path
        const fileName = `${prefix}/${sessionId}/${timestamp}-${uniqueId}.${extension}`;
        console.log(`[Upload Base64] Target path: ${fileName}`);
        // 5. Import Firebase Storage dynamically (to avoid initialization issues)
        const { storage } = await __turbopack_context__.A("[project]/ai_core/src/firebase-admin.ts [app-route] (ecmascript, async loader)");
        const bucket = storage().bucket();
        // 6. Upload to Firebase Storage
        const file = bucket.file(fileName);
        await file.save(imageBuffer, {
            contentType: mimeType,
            metadata: {
                cacheControl: 'public, max-age=31536000',
                metadata: {
                    uploadedAt: new Date().toISOString(),
                    sessionId: sessionId,
                    source: 'chatbot-upload'
                }
            }
        });
        console.log('[Upload Base64] File saved to Storage');
        // 7. Make file publicly accessible
        await file.makePublic();
        console.log('[Upload Base64] File made public');
        // 8. Generate and return public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(`[Upload Base64] ✅ Upload complete: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('[Upload Base64] ❌ Error:', error);
        // Provide user-friendly error messages
        if (error instanceof Error) {
            // Re-throw validation errors as-is
            if (error.message.includes('Invalid base64') || error.message.includes('too large')) {
                throw error;
            }
            // Handle Firebase errors
            if (error.message.includes('PERMISSION_DENIED')) {
                throw new Error('Storage permission denied. Please check Firebase Storage rules.');
            }
            if (error.message.includes('QUOTA_EXCEEDED')) {
                throw new Error('Storage quota exceeded. Please contact support.');
            }
        }
        // Generic error for unexpected issues
        throw new Error('Failed to upload image. Please try again.');
    }
}
function isValidBase64DataUrl(data) {
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp|bmp);base64,/;
    return base64Regex.test(data);
}
function extractMimeType(base64Data) {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,/);
    return matches ? matches[1] : null;
}
}),
"[project]/ai_core/src/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$vision$2f$analyze$2d$room$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/vision/analyze-room.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$generate$2d$interior$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/generate-interior.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$prompt$2d$builders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/prompt-builders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$chat$2d$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/chat-tools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$ai$2d$retry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/ai-retry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$leads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/db/leads.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$messages$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/db/messages.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$upload$2d$base64$2d$image$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/upload-base64-image.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$leads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$messages$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$leads$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$db$2f$messages$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web_client/lib/firebase-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>db,
    "getFirebaseStorage",
    ()=>getFirebaseStorage,
    "getFirestoreDb",
    ()=>getFirestoreDb,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/storage [external] (firebase-admin/storage, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/**
 * Firebase Admin SDK initialization for server-side operations
 * Singleton pattern ensures single instance across serverless invocations
 * ALWAYS loads from firebase-service-account.json for reliability
 */ let firebaseApp;
let firestoreInstance;
let storageInstance;
/**
 * ✅ CRITICAL FIX #2: Validate Firebase credentials format
 * Prevents security risks from malformed credentials
 */ /**
 * ✅ CRITICAL FIX #2: Sanitize and Validate Firebase Private Key
 * Prevents security risks from malformed credentials and ensures correct format.
 * Returns the sanitized private key.
 */ function sanitizeAndValidatePrivateKey(privateKey) {
    if (!privateKey) {
        throw new Error('[Firebase] Private key is missing');
    }
    // 1. Sanitize: Handle both escaped (\n) and unescaped newlines
    let sanitizedKey = privateKey.replace(/\\n/g, '\n');
    // 2. Sanitize: Remove wrapping quotes if present (common env var issue)
    if (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"')) {
        sanitizedKey = sanitizedKey.slice(1, -1);
    }
    if (sanitizedKey.startsWith("'") && sanitizedKey.endsWith("'")) {
        sanitizedKey = sanitizedKey.slice(1, -1);
    }
    // 3. Validation: Check for standard PEM format markers
    if (!sanitizedKey.includes('BEGIN PRIVATE KEY') || !sanitizedKey.includes('END PRIVATE KEY')) {
        throw new Error('[Firebase] Invalid private key format - must be a valid RSA private key (PEM format)');
    }
    // 4. Validation: content check
    const keyContent = sanitizedKey.split('BEGIN PRIVATE KEY')[1]?.split('END PRIVATE KEY')[0];
    if (!keyContent || keyContent.trim().length < 100) {
        throw new Error('[Firebase] Private key appears to be truncated or empty');
    }
    // 5. Re-verify newlines for PEM validity
    if (!sanitizedKey.includes('\n')) {
        throw new Error('[Firebase] Private key invalid: missing newlines after sanitization');
    }
    return sanitizedKey;
}
/**
 * Validates other credential fields
 */ function validateServiceAccount(clientEmail, projectId) {
    // Validate email format
    if (!clientEmail || !clientEmail.includes('@') || !clientEmail.endsWith('.gserviceaccount.com')) {
        throw new Error(`[Firebase] Invalid service account email: ${clientEmail} - must end with .gserviceaccount.com`);
    }
    // Validate project ID format
    if (!projectId || projectId.length < 6 || !/^[a-z0-9-]+$/.test(projectId)) {
        throw new Error(`[Firebase] Invalid project ID: ${projectId} - must contain only lowercase letters, numbers, and hyphens`);
    }
}
/**
 * Initialize Firebase Admin SDK
 * Loads from environment variables (Vercel-compatible) or falls back to JSON file
 */ function initializeFirebase() {
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["getApps"])().length === 0) {
        console.log('[Firebase] Initializing Firebase Admin SDK...');
        try {
            // Try environment variables first (Vercel-compatible)
            // Try environment variables first (Vercel-compatible)
            const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (rawPrivateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
                console.log('[Firebase] Loading credentials from environment variables');
                // ✅ CRITICAL FIX #2: Sanitize & Validate
                const privateKey = sanitizeAndValidatePrivateKey(rawPrivateKey);
                validateServiceAccount(process.env.FIREBASE_CLIENT_EMAIL, process.env.FIREBASE_PROJECT_ID);
                firebaseApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["initializeApp"])({
                    credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["cert"])({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey
                    }),
                    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
                });
                console.log('[Firebase] ✅ Successfully initialized from environment variables');
                return firebaseApp;
            }
            // Fallback to JSON file (local development)
            const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
            const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
            const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
            console.log('[Firebase] Loading credentials from:', serviceAccountPath);
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Firebase service account file not found at: ${serviceAccountPath}. Please ensure firebase-service-account.json exists in the project root OR set environment variables.`);
            }
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            // ✅ CRITICAL FIX #2: Validate JSON file credentials
            const privateKey = sanitizeAndValidatePrivateKey(serviceAccount.private_key);
            validateServiceAccount(serviceAccount.client_email, serviceAccount.project_id);
            firebaseApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["initializeApp"])({
                credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["cert"])({
                    ...serviceAccount,
                    private_key: privateKey // Use sanitized key
                }),
                storageBucket: serviceAccount.project_id + '.firebasestorage.app'
            });
            console.log('[Firebase] ✅ Successfully initialized from JSON file');
            return firebaseApp; // Assert not null since we just initialized it
        } catch (error) {
            console.error('[Firebase] ❌ Initialization FAILED:', error);
            throw error;
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$29$__["getApps"])()[0];
}
function getFirestoreDb() {
    if (!firestoreInstance) {
        const app = initializeFirebase();
        firestoreInstance = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["getFirestore"])(app);
    // REMOVED: settings() call - was causing "already initialized" error
    }
    return firestoreInstance;
}
function getFirebaseStorage() {
    if (!storageInstance) {
        const app = initializeFirebase();
        storageInstance = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$29$__["getStorage"])(app);
    }
    return storageInstance;
}
const db = getFirestoreDb;
const storage = getFirebaseStorage;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web_client/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Hybrid Rate Limiter - Firestore + In-Memory Cache
 * 
 * Architecture:
 * - Level 1: In-memory cache (fast, 10s TTL)
 * - Level 2: Firestore transaction (authoritative, distributed)
 * 
 * Benefits:
 * - Low latency for repeated requests (~0ms cache hit)
 * - Distributed protection against abuse
 * - Works across serverless instances
 */ __turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "cleanupExpiredRateLimits",
    ()=>cleanupExpiredRateLimits,
    "getRateLimitStats",
    ()=>getRateLimitStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web_client/lib/firebase-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// Get Firestore instance
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"])();
// Configuration
const WINDOW_MS = 60000; // 1 minute sliding window
const MAX_REQUESTS = 20; // 20 requests per minute
const CACHE_TTL_MS = 10000; // 10 seconds cache
// In-memory cache for fast lookups
const cache = new Map();
// ✅ BUG FIX #1: Proper interval cleanup to prevent memory leak
let cleanupInterval = null;
function initializeCleanup() {
    if (cleanupInterval) return; // Already initialized
    cleanupInterval = setInterval(()=>{
        const now = Date.now();
        for (const [key, value] of cache.entries()){
            if (now - value.timestamp > CACHE_TTL_MS) {
                cache.delete(key);
            }
        }
    }, 30000); // Clean every 30 seconds
    console.log('[RateLimit] Cache cleanup interval initialized');
}
// Initialize cleanup on module load
initializeCleanup();
// Cleanup on process termination (important for serverless)
process.on('beforeExit', ()=>{
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
        console.log('[RateLimit] Cache cleanup interval cleared');
    }
});
async function checkRateLimit(ip) {
    // Always check Firestore for accurate counting
    // NOTE: Cache was causing issues with window resets
    console.log('[RateLimit] Checking Firestore for IP:', ip);
    const result = await checkFirestoreRateLimit(ip);
    return result;
}
/**
 * Firestore-based rate limiting with sliding window
 */ async function checkFirestoreRateLimit(ip) {
    const rateLimitRef = db.collection('rate_limits').doc(ip);
    const result = await db.runTransaction(async (transaction)=>{
        const doc = await transaction.get(rateLimitRef);
        const now = Date.now();
        if (!doc.exists) {
            // First request from this IP
            transaction.set(rateLimitRef, {
                count: 1,
                windowStart: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(now),
                lastRequest: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(now)
            });
            return {
                allowed: true,
                remaining: MAX_REQUESTS - 1,
                resetAt: now + WINDOW_MS
            };
        }
        const data = doc.data(); // Firestore returns Timestamp objects
        const windowStart = data.windowStart.toMillis();
        const timeSinceWindowStart = now - windowStart;
        // Check if we need a new window
        if (timeSinceWindowStart >= WINDOW_MS) {
            // Start new window
            transaction.update(rateLimitRef, {
                count: 1,
                windowStart: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(now),
                lastRequest: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(now)
            });
            return {
                allowed: true,
                remaining: MAX_REQUESTS - 1,
                resetAt: now + WINDOW_MS
            };
        }
        // Within existing window
        if (data.count >= MAX_REQUESTS) {
            // Rate limit exceeded
            return {
                allowed: false,
                remaining: 0,
                resetAt: windowStart + WINDOW_MS
            };
        }
        // Increment counter
        transaction.update(rateLimitRef, {
            count: data.count + 1,
            lastRequest: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(now)
        });
        return {
            allowed: true,
            remaining: MAX_REQUESTS - (data.count + 1),
            resetAt: windowStart + WINDOW_MS
        };
    });
    return {
        ...result,
        resetAt: new Date(result.resetAt)
    };
}
async function cleanupExpiredRateLimits() {
    const twoHoursAgo = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$29$__["Timestamp"].fromMillis(Date.now() - 7200000);
    const snapshot = await db.collection('rate_limits').where('lastRequest', '<', twoHoursAgo).limit(500).get();
    if (snapshot.empty) {
        return 0;
    }
    const batch = db.batch();
    snapshot.docs.forEach((doc)=>batch.delete(doc.ref));
    await batch.commit();
    console.log(`[RateLimit Cleanup] Deleted ${snapshot.size} expired records`);
    return snapshot.size;
}
async function getRateLimitStats(ip) {
    const doc = await db.collection('rate_limits').doc(ip).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
        count: data.count,
        windowStart: data.windowStart.toMillis(),
        lastRequest: data.lastRequest.toMillis()
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/web_client/app/api/upload-image/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/ai_core/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$upload$2d$base64$2d$image$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/ai_core/src/imagen/upload-base64-image.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web_client/lib/rate-limit.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { image, sessionId } = body;
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🔒 SECURITY VALIDATION
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. Required fields
        if (!image || !sessionId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Missing required fields'
            }, {
                status: 400
            });
        }
        // 2. SessionId Validation & Sanitization (prevent path traversal)
        if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{20,50}$/.test(sessionId)) {
            console.error('[Upload Image API] ❌ Invalid sessionId format:', sessionId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid session format'
            }, {
                status: 400
            });
        }
        // 3. Rate Limiting (20 uploads/minute per session - uses existing rate limiter)
        const rateLimitKey = `upload-${sessionId}`;
        const rateLimitResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web_client$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(rateLimitKey);
        if (!rateLimitResult.allowed) {
            const retryMs = rateLimitResult.resetAt.getTime() - Date.now();
            const retrySec = Math.ceil(retryMs / 1000);
            console.warn(`[Upload Image API] ⚠️ Rate limit exceeded for session: ${sessionId.substring(0, 8)}...`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: `Too many uploads. Please wait ${retrySec} seconds.`
            }, {
                status: 429,
                headers: {
                    'Retry-After': retrySec.toString()
                }
            });
        }
        // 4. Base64 Format Validation
        if (!image.startsWith('data:image/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid image format.'
            }, {
                status: 400
            });
        }
        // 5. MIME Type Whitelist (prevent upload of non-images)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];
        const mimeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
        if (!mimeMatch || !allowedMimeTypes.includes(mimeMatch[1])) {
            console.error('[Upload Image API] ❌ Invalid MIME type:', mimeMatch?.[1]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Unsupported image format. Use JPEG, PNG, or WebP.'
            }, {
                status: 400
            });
        }
        // 6. Size Validation (prevent huge payloads)
        const maxSizeBytes = 15 * 1024 * 1024; // 15MB base64 (≈11MB actual)
        if (image.length > maxSizeBytes) {
            const sizeMB = (image.length / 1024 / 1024).toFixed(2);
            console.error(`[Upload Image API] ❌ Image too large: ${sizeMB}MB`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Image too large. Maximum 10MB.'
            }, {
                status: 413
            });
        }
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📤 UPLOAD TO STORAGE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('[Upload Image API] ✅ Validation passed, uploading...');
        console.log('[Upload Image API] Session:', sessionId.substring(0, 8) + '...');
        const publicUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$ai_core$2f$src$2f$imagen$2f$upload$2d$base64$2d$image$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadBase64Image"])({
            base64Data: image,
            sessionId: sessionId,
            prefix: 'user-uploads'
        });
        console.log('[Upload Image API] ✅ Upload successful');
        // ✅ SECURITY: Don't return full base64 in response (save bandwidth)
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error('[Upload Image API] Error:', error);
        // ✅ SECURITY: Don't leak internal error details to client
        const errorMessage = error instanceof Error && error.message.includes('too large') ? error.message : 'Upload failed. Please try again.';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: errorMessage
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__440d9e55._.js.map