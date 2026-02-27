/**
 * Cloudinary Upload Service
 *
 * Uploads files directly from the browser to Cloudinary using
 * their unsigned upload preset flow. No backend needed.
 *
 * Docs: https://cloudinary.com/documentation/upload_images#unsigned_upload
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export interface CloudinaryUploadResult {
    /** The public URL for the uploaded asset */
    secure_url: string;
    /** Cloudinary public ID (useful for transformations) */
    public_id: string;
    /** Asset type (e.g. "video") */
    resource_type: string;
    /** Original filename */
    original_filename: string;
    /** File size in bytes */
    bytes: number;
    /** Duration in seconds (for video/audio) */
    duration?: number;
    /** Width in pixels (for video/image) */
    width?: number;
    /** Height in pixels (for video/image) */
    height?: number;
    /** Format (e.g. "mp4") */
    format: string;
    /** Auto-generated thumbnail URL */
    thumbnail_url?: string;
    /** Created timestamp */
    created_at: string;
}

export interface UploadProgressCallback {
    (progress: number): void;
}

/**
 * Upload a video file to Cloudinary with progress tracking.
 *
 * @param file        The File object to upload
 * @param onProgress  Callback that receives upload progress (0–100)
 * @param metadata    Optional context metadata (class, subject, chapter, etc.)
 * @returns           The Cloudinary upload result
 */
export function uploadVideoToCloudinary(
    file: File,
    onProgress?: UploadProgressCallback,
    metadata?: Record<string, string>,
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        if (!CLOUD_NAME) {
            reject(new Error('VITE_CLOUDINARY_CLOUD_NAME is not configured'));
            return;
        }
        if (!UPLOAD_PRESET) {
            reject(new Error('VITE_CLOUDINARY_UPLOAD_PRESET is not configured'));
            return;
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('resource_type', 'video');

        // Add metadata as context so it's searchable in Cloudinary
        if (metadata) {
            const contextParts = Object.entries(metadata)
                .map(([k, v]) => `${k}=${v}`)
                .join('|');
            formData.append('context', contextParts);

            // Use folder structure: acadevia/class_10/science/chapter_name
            const folder = [
                'acadevia',
                metadata.class ? `class_${metadata.class}` : null,
                metadata.subject?.toLowerCase(),
                metadata.chapter?.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            ]
                .filter(Boolean)
                .join('/');
            formData.append('folder', folder);
        }

        // Add tags for easier filtering
        if (metadata?.class) formData.append('tags', `class_${metadata.class},${metadata.subject || 'science'}`);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const pct = Math.round((e.loaded / e.total) * 100);
                onProgress(pct);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                    // Build a thumbnail URL from the video
                    result.thumbnail_url = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_400,h_225,c_fill,so_1/${result.public_id}.jpg`;
                    resolve(result);
                } catch {
                    reject(new Error('Failed to parse Cloudinary response'));
                }
            } else {
                let msg = `Upload failed (${xhr.status})`;
                try {
                    const err = JSON.parse(xhr.responseText);
                    msg = err?.error?.message || msg;
                } catch { /* ignore */ }
                reject(new Error(msg));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled')));

        xhr.open('POST', url);
        xhr.send(formData);
    });
}

/**
 * Get the optimised streaming URL for a Cloudinary video.
 */
export function getVideoStreamUrl(publicId: string): string {
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto/${publicId}.mp4`;
}

/**
 * Get adaptive streaming (HLS) URL for a Cloudinary video.
 */
export function getVideoHlsUrl(publicId: string): string {
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_auto/${publicId}.m3u8`;
}

/**
 * Get a thumbnail image from a video at a specific second.
 */
export function getVideoThumbnail(publicId: string, width = 400, height = 225, second = 1): string {
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${width},h_${height},c_fill,so_${second}/${publicId}.jpg`;
}

/**
 * Fetch videos from Cloudinary by tag using the client-side JSON list API.
 * 
 * NOTE: You must enable the "Resource list" delivery type in Cloudinary settings:
 *   Settings → Security → Restricted media types → ensure "Resource list" is allowed
 */
export async function listVideosByTag(tag: string): Promise<CloudinaryUploadResult[]> {
    const url = `https://res.cloudinary.com/${CLOUD_NAME}/video/list/${tag}.json`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) return [];
        const data = await resp.json();
        return (data.resources || []).map((r: any) => ({
            secure_url: `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${r.public_id}.${r.format}`,
            public_id: r.public_id,
            resource_type: 'video',
            original_filename: r.public_id.split('/').pop() || r.public_id,
            bytes: r.bytes || 0,
            duration: r.duration,
            width: r.width,
            height: r.height,
            format: r.format || 'mp4',
            thumbnail_url: `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_400,h_225,c_fill,so_1/${r.public_id}.jpg`,
            created_at: r.created_at || new Date().toISOString(),
        }));
    } catch {
        return [];
    }
}

export { CLOUD_NAME };
