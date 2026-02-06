import { useState, useCallback, useEffect } from 'react';
import { useImageUpload } from './useImageUpload';

export interface MediaUploadState {
    id: string;
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    progress: number;
    status: 'idle' | 'compressing' | 'uploading' | 'done' | 'error';
    publicUrl?: string;
    errorMessage?: string;
    trimRange?: { start: number; end: number };
}

/**
 * Unified Media Upload Hook (Refactored)
 * 
 * **Phase 4 Refactoring**: This hook now delegates to specialized hooks
 * (`useImageUpload`) while maintaining the same public interface for
 * backward compatibility with ChatWidget.tsx.
 * 
 * **Migration**: Internally uses Python backend via `useImageUpload`,
 * eliminating the Shadow API `/api/get-upload-url`.
 * 
 * **Note**: This is a compatibility wrapper. For new code, prefer using
 * `useImageUpload` and `useVideoUpload` directly.
 */
export function useMediaUpload(sessionId: string) {
    const [mediaItems, setMediaItems] = useState<MediaUploadState[]>([]);

    // Delegate to useImageUpload for actual upload logic
    const {
        selectedImages,
        imageUrls,
        isUploading: imageUploading,
        handleFileSelect: imageFileSelect,
        removeImage: removeImageByIndex,
        clearImages: clearAllImages
    } = useImageUpload(sessionId);

    // Sync imageUrls with mediaItems state
    useEffect(() => {
        const items: MediaUploadState[] = imageUrls.map((url, index) => ({
            id: `img-${index}-${Date.now()}`,
            file: new File([], `image-${index}.jpg`, { type: 'image/jpeg' }), // Placeholder
            previewUrl: selectedImages[index] || url,
            type: 'image' as const,
            progress: 100,
            status: 'done' as const,
            publicUrl: url
        }));
        setMediaItems(items);
    }, [imageUrls, selectedImages]);

    const addFiles = useCallback(async (files: File[]) => {
        if (!sessionId) return;

        // Filter only images (videos not supported in this wrapper)
        const imageFiles = files.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            console.warn('[useMediaUpload] No image files provided');
            return;
        }

        // Create synthetic event for useImageUpload
        const dataTransfer = new DataTransfer();
        imageFiles.forEach(file => dataTransfer.items.add(file));

        const syntheticEvent = {
            target: {
                files: dataTransfer.files
            }
        } as React.ChangeEvent<HTMLInputElement>;

        await imageFileSelect(syntheticEvent);
    }, [sessionId, imageFileSelect]);

    const removeMedia = useCallback((id: string) => {
        const index = mediaItems.findIndex(item => item.id === id);
        if (index !== -1) {
            removeImageByIndex(index);
        }
    }, [mediaItems, removeImageByIndex]);

    const clearMedia = useCallback(() => {
        clearAllImages();
    }, [clearAllImages]);

    const updateMediaItem = useCallback((id: string, partial: Partial<MediaUploadState>) => {
        setMediaItems(prev => prev.map(i => i.id === id ? { ...i, ...partial } : i));
    }, []);

    return {
        mediaItems,
        addFiles,
        removeMedia,
        clearMedia,
        updateMediaItem,
        isGlobalUploading: imageUploading
    };
}
