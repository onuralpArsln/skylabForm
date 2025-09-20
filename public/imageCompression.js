/**
 * Image Compression Utility
 * Automatically compresses images to fit within 1MB size limit
 */

class ImageCompressor {
    constructor() {
        this.maxSizeBytes = 1024 * 1024; // 1MB
        this.maxWidth = 1920; // Maximum width for compression
        this.maxHeight = 1080; // Maximum height for compression
        this.quality = 0.8; // Initial quality (0.1 to 1.0)
        this.minQuality = 0.1; // Minimum quality to prevent infinite loops
    }

    /**
     * Compress an image file to fit within the size limit
     * @param {File} file - The image file to compress
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise<File>} - Compressed file
     */
    async compressImage(file, onProgress = null) {
        return new Promise((resolve, reject) => {
            // Check if file is already small enough
            if (file.size <= this.maxSizeBytes) {
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculate new dimensions while maintaining aspect ratio
                    let { width, height } = this.calculateDimensions(img.width, img.height);

                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress the image
                    this.compressWithQuality(ctx, img, width, height, file.type, onProgress)
                        .then(compressedFile => resolve(compressedFile))
                        .catch(error => reject(error));
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate optimal dimensions for compression
     */
    calculateDimensions(originalWidth, originalHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // Scale down if image is too large
        if (width > this.maxWidth || height > this.maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
                width = Math.min(this.maxWidth, width);
                height = width / aspectRatio;
            } else {
                height = Math.min(this.maxHeight, height);
                width = height * aspectRatio;
            }
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * Compress image with iterative quality reduction
     */
    async compressWithQuality(ctx, img, width, height, mimeType, onProgress) {
        let quality = this.quality;
        let compressedFile;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob with current quality
            const blob = await this.canvasToBlob(canvas, mimeType, quality);
            compressedFile = new File([blob], 'compressed_image.jpg', { type: mimeType });

            // Check if size is acceptable
            if (compressedFile.size <= this.maxSizeBytes) {
                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality: quality,
                        attempts: attempts + 1,
                        success: true
                    });
                }
                return compressedFile;
            }

            // Reduce quality for next attempt
            quality = Math.max(quality * 0.7, this.minQuality);
            attempts++;

            if (onProgress) {
                onProgress({
                    size: compressedFile.size,
                    quality: quality,
                    attempts: attempts,
                    success: false
                });
            }
        }

        // If we couldn't compress enough, return the smallest we achieved
        console.warn(`Could not compress image to ${this.maxSizeBytes} bytes. Final size: ${compressedFile.size} bytes`);
        return compressedFile;
    }

    /**
     * Convert canvas to blob with specified quality
     */
    canvasToBlob(canvas, mimeType, quality) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, mimeType, quality);
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Show compression progress
     */
    showProgress(elementId, progress) {
        const element = document.getElementById(elementId);
        if (element) {
            const sizeText = this.formatFileSize(progress.size);
            const targetSize = this.formatFileSize(this.maxSizeBytes);
            element.innerHTML = `
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Compressing... ${sizeText} / ${targetSize} (Quality: ${Math.round(progress.quality * 100)}%)
                </div>
            `;
        }
    }

    /**
     * Show compression result
     */
    showResult(elementId, originalSize, compressedSize, success) {
        const element = document.getElementById(elementId);
        if (element) {
            const originalText = this.formatFileSize(originalSize);
            const compressedText = this.formatFileSize(compressedSize);
            const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);

            element.innerHTML = `
                <div style="font-size: 12px; margin-top: 5px; color: ${success ? '#27ae60' : '#e74c3c'};">
                    ${success ? '✓' : '⚠'} Compressed: ${originalText} → ${compressedText} (${reduction}% reduction)
                </div>
            `;
        }
    }
}

// Create global instance
window.imageCompressor = new ImageCompressor();

// Utility function for easy use
window.compressImage = function (file, onProgress) {
    return window.imageCompressor.compressImage(file, onProgress);
};
