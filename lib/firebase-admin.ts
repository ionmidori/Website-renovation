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
