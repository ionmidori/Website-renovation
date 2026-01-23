/**
 * Haptic Feedback Utility
 * Provides tactile response for premium mobile usage.
 * Uses the Vibration API where supported.
 */
export const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10); // 10ms "micro-tap"
    }
};
