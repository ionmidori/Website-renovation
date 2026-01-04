import { db } from '../firebase-admin';
import { COLLECTIONS } from './schema';
import { FieldValue } from 'firebase-admin/firestore';
/**
 * Save lead data to Firestore
 * Called from the submit_lead_data tool
 */
export async function saveLead(data) {
    try {
        const firestore = db();
        const leadData = {
            ...data,
            createdAt: FieldValue.serverTimestamp(),
            status: 'new',
        };
        const leadRef = await firestore
            .collection(COLLECTIONS.LEADS)
            .add(leadData);
        console.log(`[saveLead] Lead saved with ID: ${leadRef.id}`);
        return {
            success: true,
            leadId: leadRef.id,
        };
    }
    catch (error) {
        console.error('[saveLead] Error saving lead:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Get all leads (for admin dashboard - optional)
 */
export async function getLeads(status, limit = 50) {
    try {
        const firestore = db();
        let query = firestore
            .collection(COLLECTIONS.LEADS)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        if (status) {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));
    }
    catch (error) {
        console.error('[getLeads] Error fetching leads:', error);
        return [];
    }
}
