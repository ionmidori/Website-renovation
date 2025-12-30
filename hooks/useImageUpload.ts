import { useState } from 'react';

/**
 * Custom hook for image upload, compression, and preview management
 * Extracted from ChatWidget.tsx (lines 219, 282-337)
 */
export function useImageUpload() {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Image Compression
    const compressImageForGemini = async (file: File): Promise<Blob> => {
        const maxWidth = 2048;
        const quality = 0.8;
        const mimeType = 'image/jpeg';
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Compression failed'));
                    }, mimeType, quality);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Handle File Selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSelectedImages(prev => [...prev, base64]);
            };

            try {
                const compressed = await compressImageForGemini(file);
                reader.readAsDataURL(compressed);
            } catch (err) {
                reader.readAsDataURL(file); // Fallback
            }
        }
    };

    // Remove selected image
    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Clear all images
    const clearImages = () => {
        setSelectedImages([]);
    };

    return {
        selectedImages,
        handleFileSelect,
        removeImage,
        clearImages
    };
}
