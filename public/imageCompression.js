/**
 * Image Compression Utility
 * Automatically compresses images to fit within 1MB size limit
 */

class ImageCompressor {
    constructor() {
        this.maxSizeBytes = 1024 * 1024; // 1MB
        this.maxWidth = 1920; // Maximum width for compression
        this.maxHeight = 1080; // Maximum height for compression
        this.quality = 0.9; // Initial quality (0.1 to 1.0) - start higher
        this.minQuality = 0.05; // Lower minimum quality for better compression
        this.qualityStep = 0.15; // Smaller steps for more precise control
        this.maxAttempts = 15; // More attempts for better results
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
                    let { width, height } = this.calculateDimensions(img.width, img.height, file.size);

                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress the image
                    this.compressWithQuality(ctx, img, width, height, file.type, onProgress, file)
                        .then(compressedFile => {
                            // If compression failed to get under 1MB, try more aggressive approach
                            if (compressedFile.size > this.maxSizeBytes) {
                                this.aggressiveCompress(ctx, img, file, onProgress)
                                    .then(aggressiveResult => resolve(aggressiveResult))
                                    .catch(error => {
                                        console.warn('Aggressive compression also failed, returning best result');
                                        resolve(compressedFile);
                                    });
                            } else {
                                resolve(compressedFile);
                            }
                        })
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
     * More aggressive compression as fallback
     */
    async aggressiveCompress(ctx, img, file, onProgress) {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Start with much smaller dimensions
        let scaleFactor = Math.sqrt(this.maxSizeBytes / file.size) * 0.7;
        let width = Math.round(originalWidth * scaleFactor);
        let height = Math.round(originalHeight * scaleFactor);

        // Ensure minimum reasonable size
        width = Math.max(width, 200);
        height = Math.max(height, 200);

        const canvas = ctx.canvas;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try with very low quality
        const optimalMimeType = this.getOptimalMimeType(file.type);
        const blob = await this.canvasToBlob(canvas, optimalMimeType, 0.1);
        const compressedFile = new File([blob], 'compressed_image.jpg', { type: optimalMimeType });

        if (onProgress) {
            onProgress({
                size: compressedFile.size,
                quality: 0.1,
                attempts: 0,
                success: compressedFile.size <= this.maxSizeBytes,
                dimensions: `${width}x${height}`,
                action: 'Aggressive compression'
            });
        }

        return compressedFile;
    }

    /**
     * Calculate optimal dimensions for compression
     */
    calculateDimensions(originalWidth, originalHeight, targetSize = null) {
        let width = originalWidth;
        let height = originalHeight;

        // If we have a target size, calculate more aggressive scaling
        if (targetSize && targetSize > this.maxSizeBytes) {
            const scaleFactor = Math.sqrt(this.maxSizeBytes / targetSize);
            width = Math.round(width * scaleFactor);
            height = Math.round(height * scaleFactor);
        }

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
     * Compress image with iterative quality reduction and dimension scaling
     */
    async compressWithQuality(ctx, img, width, height, mimeType, onProgress, originalFile) {
        let quality = this.quality;
        let compressedFile;
        let attempts = 0;
        let currentWidth = width;
        let currentHeight = height;
        let bestResult = null;

        while (attempts < this.maxAttempts) {
            // Clear canvas
            ctx.clearRect(0, 0, currentWidth, currentHeight);

            // Draw image
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

            // Convert to blob with current quality
            const optimalMimeType = this.getOptimalMimeType(mimeType);
            const blob = await this.canvasToBlob(canvas, optimalMimeType, quality);
            compressedFile = new File([blob], 'compressed_image.jpg', { type: optimalMimeType });

            // Keep track of best result so far
            if (!bestResult || compressedFile.size < bestResult.size) {
                bestResult = compressedFile;
            }

            // Check if size is acceptable
            if (compressedFile.size <= this.maxSizeBytes) {
                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality: quality,
                        attempts: attempts + 1,
                        success: true,
                        dimensions: `${currentWidth}x${currentHeight}`
                    });
                }
                return compressedFile;
            }

            // If we're still too large, try reducing dimensions
            if (attempts > 3 && compressedFile.size > this.maxSizeBytes * 1.5) {
                const scaleFactor = 0.8;
                currentWidth = Math.round(currentWidth * scaleFactor);
                currentHeight = Math.round(currentHeight * scaleFactor);

                // Update canvas size
                canvas.width = currentWidth;
                canvas.height = currentHeight;

                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality: quality,
                        attempts: attempts + 1,
                        success: false,
                        dimensions: `${currentWidth}x${currentHeight}`,
                        action: 'Reducing dimensions'
                    });
                }
            } else {
                // Reduce quality for next attempt
                quality = Math.max(quality - this.qualityStep, this.minQuality);

                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality: quality,
                        attempts: attempts + 1,
                        success: false,
                        dimensions: `${currentWidth}x${currentHeight}`,
                        action: 'Reducing quality'
                    });
                }
            }

            attempts++;
        }

        // If we couldn't compress enough, return the best result we achieved
        console.warn(`Could not compress image to ${this.maxSizeBytes} bytes. Final size: ${bestResult.size} bytes`);
        return bestResult;
    }

    /**
     * Convert canvas to blob with specified quality
     */
    canvasToBlob(canvas, mimeType, quality) {
        return new Promise((resolve) => {
            // For better compression, convert all images to JPEG
            const outputMimeType = mimeType === 'image/png' ? 'image/jpeg' : mimeType;
            canvas.toBlob(resolve, outputMimeType, quality);
        });
    }

    /**
     * Get optimal MIME type for compression
     */
    getOptimalMimeType(originalMimeType) {
        // JPEG generally compresses better than PNG for photos
        if (originalMimeType === 'image/png' || originalMimeType === 'image/webp') {
            return 'image/jpeg';
        }
        return originalMimeType;
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
            const dimensions = progress.dimensions || '';
            const action = progress.action || '';

            element.innerHTML = `
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    ${action ? `${action}... ` : 'Compressing... '}${sizeText} / ${targetSize} 
                    ${dimensions ? `(${dimensions})` : ''} 
                    (Quality: ${Math.round(progress.quality * 100)}%)
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
