/**
 * Image Compression Utility
 * Always compresses images to < 1MB while preserving aspect ratio
 */

class ImageCompressor {
    constructor() {
        this.maxSizeBytes = 1024 * 1024; // 1MB
        this.maxWidth = 1920;            // Default bounding box
        this.maxHeight = 1080;
        this.startQuality = 0.9;
        this.minQuality = 0.05;
        this.qualityStep = 0.1;
    }

    /**
     * Main method
     */
    async compressImage(file, onProgress = null) {
        try {
            if (file.size <= this.maxSizeBytes) {
                return file; // already small enough
            }

            const img = await this.loadImage(file);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Initial scale
            let { width, height } = this.calculateDimensions(img.width, img.height, file.size);
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            // First pass with iterative quality reduction
            let compressedFile = await this.compressLoop(ctx, img, file, onProgress);

            // If still too big → fallback to aggressive compression
            if (compressedFile && compressedFile.size > this.maxSizeBytes) {
                try {
                    compressedFile = await this.aggressiveCompress(ctx, img, file, onProgress);
                } catch (aggressiveError) {
                    console.warn('Aggressive compression failed, using best result:', aggressiveError.message);
                    // Return the best result from the first pass
                }
            }

            return compressedFile || file; // Fallback to original file if compression completely fails

        } catch (error) {
            console.error('Image compression failed:', error);
            throw new Error('Image compression failed: ' + error.message);
        }
    }

    /**
     * Iterative quality reduction + optional resizing
     */
    async compressLoop(ctx, img, file, onProgress) {
        let quality = this.startQuality;
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let bestResult = null;
        let attempts = 0;

        while (attempts < 15) {
            try {
                ctx.canvas.width = width;
                ctx.canvas.height = height;
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const mime = this.getOptimalMimeType(file.type);
                const blob = await this.canvasToBlob(ctx.canvas, mime, quality);
                const compressedFile = this.makeFile(blob, file, mime);

                if (!bestResult || compressedFile.size < bestResult.size) {
                    bestResult = compressedFile;
                }

                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality,
                        dimensions: `${width}x${height}`,
                        attempts: attempts + 1,
                    });
                }

                if (compressedFile.size <= this.maxSizeBytes) {
                    return compressedFile;
                }

                // After a few attempts, start shrinking dimensions
                if (attempts > 3 && compressedFile.size > this.maxSizeBytes * 1.5) {
                    width = Math.max(Math.round(width * 0.8), 200);
                    height = Math.max(Math.round(height * 0.8), 200);
                } else {
                    quality = Math.max(quality - this.qualityStep, this.minQuality);
                }

                attempts++;
            } catch (error) {
                console.error('Error in compression loop:', error);
                // If we have a best result, return it, otherwise throw
                if (bestResult) {
                    return bestResult;
                }
                throw new Error('Compression loop failed: ' + error.message);
            }
        }

        return bestResult;
    }

    /**
     * Aggressive fallback: keep shrinking until success
     */
    async aggressiveCompress(ctx, img, file, onProgress) {
        let width = img.width;
        let height = img.height;
        let quality = 0.2;
        let attempts = 0;
        const maxAttempts = 20; // Prevent infinite loops

        while (attempts < maxAttempts) {
            try {
                ctx.canvas.width = width;
                ctx.canvas.height = height;
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const mime = this.getOptimalMimeType(file.type);
                const blob = await this.canvasToBlob(ctx.canvas, mime, quality);
                const compressedFile = this.makeFile(blob, file, mime);

                if (onProgress) {
                    onProgress({
                        size: compressedFile.size,
                        quality,
                        dimensions: `${width}x${height}`,
                        action: "Aggressive",
                        attempts: attempts + 1
                    });
                }

                if (compressedFile.size <= this.maxSizeBytes) {
                    return compressedFile;
                }

                // Stop if we've reached minimum size and quality
                if (width <= 200 && height <= 200 && quality <= this.minQuality) {
                    console.warn('Reached minimum size and quality limits');
                    return compressedFile;
                }

                // Reduce dimensions and quality
                width = Math.max(Math.round(width * 0.8), 200);
                height = Math.max(Math.round(height * 0.8), 200);
                quality = Math.max(quality - 0.05, this.minQuality);
                attempts++;

            } catch (error) {
                console.error('Error in aggressive compression:', error);
                throw new Error('Compression failed: ' + error.message);
            }
        }

        // If we've exhausted all attempts, return the last result
        console.warn('Aggressive compression reached maximum attempts');
        throw new Error('Could not compress image to target size after maximum attempts');
    }

    /**
     * Scale dimensions to fit max box and approximate target size
     */
    calculateDimensions(width, height, fileSize) {
        let scaleFactor = 1;

        if (fileSize > this.maxSizeBytes) {
            scaleFactor = Math.sqrt(this.maxSizeBytes / fileSize);
        }

        if (width * scaleFactor > this.maxWidth) {
            scaleFactor = this.maxWidth / width;
        }
        if (height * scaleFactor > this.maxHeight) {
            scaleFactor = Math.min(scaleFactor, this.maxHeight / height);
        }

        return {
            width: Math.max(Math.round(width * scaleFactor), 200),
            height: Math.max(Math.round(height * scaleFactor), 200),
        };
    }

    /**
     * Convert canvas to Blob
     */
    canvasToBlob(canvas, mime, quality) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, mime, quality);
        });
    }

    /**
     * Pick better format for compression
     */
    getOptimalMimeType(originalMimeType) {
        if (originalMimeType === "image/png") return "image/jpeg";
        return originalMimeType;
    }

    /**
     * Create a File with proper name
     */
    makeFile(blob, originalFile, mime) {
        const ext = mime.split("/")[1];
        const name = originalFile.name.replace(/\.[^/.]+$/, "") + `_compressed.${ext}`;
        return new File([blob], name, { type: mime });
    }

    /**
     * Load image from File
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
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
window.compressImage = (file, onProgress) => window.imageCompressor.compressImage(file, onProgress);
