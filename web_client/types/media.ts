/**
 * MediaAsset Types (Golden Sync with backend_python/src/models/media.py)
 *
 * This file contains TypeScript interfaces that mirror the Python Pydantic models.
 * ANY CHANGES TO THE BACKEND MODELS MUST BE REFLECTED HERE.
 *
 * @see backend_python/src/models/media.py
 */

/**
 * Base fields common to all media asset types.
 */
interface MediaAssetBase {
    /** Unique asset ID (UUID hex) */
    id: string;
    /** Public URL to access the asset */
    url: string;
    /** Original sanitized filename */
    filename: string;
    /** Validated MIME type from Magic Bytes */
    mime_type: string;
    /** File size in bytes */
    size_bytes: number;
    /** ISO timestamp of upload */
    created_at?: string;
}

/**
 * Image-specific asset.
 * Discriminator: asset_type = "image"
 */
export interface ImageMediaAsset extends MediaAssetBase {
    asset_type: 'image';
    /** Image width in pixels */
    width?: number;
    /** Image height in pixels */
    height?: number;
    /** Storage path in bucket */
    file_path: string;
    /** Signed URL (expires) */
    signed_url?: string;
}

/**
 * Video-specific asset.
 * Discriminator: asset_type = "video"
 */
export interface VideoMediaAsset extends MediaAssetBase {
    asset_type: 'video';
    /** Video width in pixels */
    width?: number;
    /** Video height in pixels */
    height?: number;
    /** Duration in seconds */
    duration_seconds?: number;
    /** Google AI File API URI */
    file_uri: string;
    /** File API processing state */
    state: string;
}

/**
 * Document-specific asset (PDF, etc).
 * Discriminator: asset_type = "document"
 */
export interface DocumentMediaAsset extends MediaAssetBase {
    asset_type: 'document';
    /** Number of pages (PDF) */
    page_count?: number;
    /** Storage path in bucket */
    file_path: string;
    /** Signed URL (expires) */
    signed_url?: string;
}

/**
 * Discriminated union type for all media assets.
 *
 * Use `asset_type` field to narrow the type:
 * ```ts
 * if (asset.asset_type === 'image') {
 *   console.log(asset.file_path); // OK
 * }
 * ```
 */
export type MediaAsset = ImageMediaAsset | VideoMediaAsset | DocumentMediaAsset;

/**
 * Type guard for ImageMediaAsset
 */
export function isImageAsset(asset: MediaAsset): asset is ImageMediaAsset {
    return asset.asset_type === 'image';
}

/**
 * Type guard for VideoMediaAsset
 */
export function isVideoAsset(asset: MediaAsset): asset is VideoMediaAsset {
    return asset.asset_type === 'video';
}

/**
 * Type guard for DocumentMediaAsset
 */
export function isDocumentAsset(asset: MediaAsset): asset is DocumentMediaAsset {
    return asset.asset_type === 'document';
}

// =============================================================================
// UPLOAD ITEM STATE (Frontend-only, used by useUpload hook)
// =============================================================================

export type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

/**
 * Frontend upload state item.
 * Tracks the lifecycle of a file from selection to completion.
 */
export interface UploadItem {
    /** Unique client-side ID (UUID) */
    id: string;
    /** Original File object */
    file: File;
    /** Local blob URL for preview */
    previewUrl: string;
    /** Upload progress (0-100) */
    progress: number;
    /** Current status */
    status: UploadStatus;
    /** Error message if status === 'error' */
    error?: string;
    /** Server response data when upload completes */
    serverData?: MediaAsset;
    /** AbortController for cancellation */
    abortController?: AbortController;
}
