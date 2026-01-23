/**
 * Debounce utility function
 * 
 * Delays the execution of a function until after a specified wait period
 * has elapsed since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function with a cancel method
 * 
 * @example
 * const debouncedResize = debounce(() => console.log('resized'), 300);
 * window.addEventListener('resize', debouncedResize);
 * 
 * // Later, to cancel pending execution:
 * debouncedResize.cancel();
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;

    const debounced = function (this: any, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    } as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}
