import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK initialization for server-side operations
 * Singleton pattern ensures single instance across serverless invocations
 * ALWAYS loads from firebase-service-account.json for reliability
 */

let firebaseApp: App | undefined;
let firestoreInstance: Firestore | undefined;
let storageInstance: Storage | undefined;

/**
 * ✅ CRITICAL FIX #2: Validate Firebase credentials format
 * Prevents security risks from malformed credentials
 */
function validateFirebaseCredentials(privateKey: string, clientEmail: string, projectId: string): void {
    // Validate private key format
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
        throw new Error('[Firebase] Invalid private key format - must be a valid RSA private key');
    }

    // Validate private key is not empty between markers
    const keyContent = privateKey.split('BEGIN PRIVATE KEY')[1]?.split('END PRIVATE KEY')[0];
    if (!keyContent || keyContent.trim().length < 100) {
        throw new Error('[Firebase] Private key appears to be truncated or empty');
    }

    // Validate email format
    if (!clientEmail.includes('@') || !clientEmail.endsWith('.gserviceaccount.com')) {
        throw new Error('[Firebase] Invalid service account email - must end with .gserviceaccount.com');
    }

    // Validate project ID format
    if (!projectId || projectId.length < 6 || !/^[a-z0-9-]+$/.test(projectId)) {
        throw new Error('[Firebase] Invalid project ID - must contain only lowercase letters, numbers, and hyphens');
    }

    console.log('[Firebase] ✅ Credentials validation passed');
}

/**
 * Initialize Firebase Admin SDK
 * Loads from environment variables (Vercel-compatible) or falls back to JSON file
 */
function initializeFirebase(): App {
    if (getApps().length === 0) {
        console.log('[Firebase] Initializing Firebase Admin SDK...');

        try {
            // Try environment variables first (Vercel-compatible)
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (privateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
                console.log('[Firebase] Loading credentials from environment variables');

                // ✅ CRITICAL FIX #2: Validate credentials before use
                validateFirebaseCredentials(
                    privateKey,
                    process.env.FIREBASE_CLIENT_EMAIL,
                    process.env.FIREBASE_PROJECT_ID
                );

                firebaseApp = initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey,
                    }),
                    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
                });

                console.log('[Firebase] ✅ Successfully initialized from environment variables');
                console.log('[Firebase] Project ID:', process.env.FIREBASE_PROJECT_ID);
                console.log('[Firebase] Storage Bucket:', `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);

                return firebaseApp;
            }

            // Fallback to JSON file (local development)
            const fs = require('fs');
            const path = require('path');

            const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

            console.log('[Firebase] Loading credentials from:', serviceAccountPath);

            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Firebase service account file not found at: ${serviceAccountPath}. Please ensure firebase-service-account.json exists in the project root OR set environment variables.`);
            }

            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

            // ✅ CRITICAL FIX #2: Validate JSON file credentials
            validateFirebaseCredentials(
                serviceAccount.private_key,
                serviceAccount.client_email,
                serviceAccount.project_id
            );

            firebaseApp = initializeApp({
                credential: cert(serviceAccount),
                storageBucket: serviceAccount.project_id + '.firebasestorage.app',
            });

            console.log('[Firebase] ✅ Successfully initialized from JSON file');
            console.log('[Firebase] Project ID:', serviceAccount.project_id);
            console.log('[Firebase] Storage Bucket:', serviceAccount.project_id + '.firebasestorage.app');

            return firebaseApp;
        } catch (error) {
            console.error('[Firebase] ❌ Initialization FAILED:', error);
            throw error;
        }
    }

    return getApps()[0];
}

/**
 * Get Firestore instance (singleton)
 * CRITICAL FIX: Removed settings() call to prevent re-initialization error
 */
export function getFirestoreDb(): Firestore {
    if (!firestoreInstance) {
        const app = initializeFirebase();
        firestoreInstance = getFirestore(app);
        // REMOVED: settings() call - was causing "already initialized" error
    }

    return firestoreInstance;
}

/**
 * Get Firebase Storage instance (singleton)
 */
export function getFirebaseStorage(): Storage {
    if (!storageInstance) {
        const app = initializeFirebase();
        storageInstance = getStorage(app);
    }

    return storageInstance;
}

// Export convenient aliases
export const db = getFirestoreDb;
export const storage = getFirebaseStorage;
