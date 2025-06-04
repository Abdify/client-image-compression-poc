class ImageCompressionExperiment {
    constructor() {
        this.originalFile = null;
        this.compressedBlob = null;
        this.bicCompressedBlob = null; // New property for browser-image-compression result
        this.originalZoom = null;
        this.compressedZoom = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const qualitySlider = document.getElementById('quality');
        const qualityValue = document.getElementById('qualityValue');
        const compressBtn = document.getElementById('compressBtn');
        const bicCompressBtn = document.getElementById('bicCompressBtn');
        const compareBtn = document.getElementById('compareBtn');
        const downloadBtn = document.getElementById('downloadBtn');
               
        // Comparison tool buttons
        const sideBySideBtn = document.getElementById('sideBySideBtn');
        const sliderComparisonBtn = document.getElementById('sliderComparisonBtn');

        // File upload handlers
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#007bff';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ccc';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ccc';
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.processFile(files[0]);
            }
        });

        // Quality slider handler
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });

        // Compression button handlers
        compressBtn.addEventListener('click', () => this.compressImage());
        bicCompressBtn.addEventListener('click', () => this.compressWithBIC());
        compareBtn.addEventListener('click', () => this.compareBothMethods());
        
        // Download button handler
        downloadBtn.addEventListener('click', () => this.downloadCompressed());
        
        // Comparison view handlers
        sideBySideBtn.addEventListener('click', () => this.showSideBySideView());
        sliderComparisonBtn.addEventListener('click', () => this.showSliderComparison());
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processFile(file);
        } else {
            alert('Please select a valid image file.');
        }
    }

    processFile(file) {
        this.originalFile = file;
        
        // Show the comparison container
        document.getElementById('container').style.display = 'block';
        
        // Display original image
        const reader = new FileReader();
        reader.onload = (e) => {
            const originalImage = document.getElementById('originalImage');
            originalImage.src = e.target.result;
            
            // Get image dimensions
            originalImage.onload = () => {
                this.updateOriginalStats(file, originalImage);
                this.setDefaultDimensions(originalImage);
            };
        };
        reader.readAsDataURL(file);
    }

    updateOriginalStats(file, img) {
        document.getElementById('originalSize').textContent = this.formatFileSize(file.size);
        document.getElementById('originalDimensions').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
        document.getElementById('originalType').textContent = file.type;
    }

    setDefaultDimensions(img) {
        document.getElementById('maxWidth').value = img.naturalWidth;
        document.getElementById('maxHeight').value = img.naturalHeight;
    }

    // convert to a promise
    async compressImage(showResult = true) {
        if (!this.originalFile) {
            alert('Please upload an image first.');
            return;
        }

        return new Promise((resolve, reject) => {

        const quality = parseFloat(document.getElementById('quality').value);
        const maxWidth = parseInt(document.getElementById('maxWidth').value) || undefined;
        const maxHeight = parseInt(document.getElementById('maxHeight').value) || undefined;
        const outputType = document.getElementById('outputType').value;

        const compressBtn = document.getElementById('compressBtn');
        compressBtn.disabled = true;
        compressBtn.textContent = 'Compressing...';

            
        new Compressor(this.originalFile, {
            quality: quality,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            mimeType: outputType,
            convertTypes: ['image/png'],
            success: (result) => {
                this.compressedBlob = result;
                if(showResult) {
                    this.hideComparisonContainer();
                    this.displayCompressedImage(result);
                    this.updateCompressedStats(result);
                }
                
                compressBtn.disabled = false;
                compressBtn.textContent = 'Compress Image';
                document.getElementById('downloadBtn').disabled = false;
                // Enable comparison tools
                document.getElementById('sideBySideBtn').disabled = false;
                document.getElementById('sliderComparisonBtn').disabled = false;
                resolve();
            },
            error: (err) => {
                console.error('Compression failed:', err);
                alert('Compression failed. Please try again.');
                
                compressBtn.disabled = false;
                compressBtn.textContent = 'Compress Image';
                reject(err);
            }
        });
    })
    }

    // Update the displayCompressedImage method to show slider comparison by default
    displayCompressedImage(blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const compressedImage = document.getElementById('compressedImage');
            compressedImage.src = e.target.result;
            compressedImage.style.display = 'block';
            
            document.getElementById('compressedStats').style.display = 'block';
            
            // Enable comparison tools only after the image is loaded
            compressedImage.onload = () => {
                document.getElementById('sideBySideBtn').disabled = false;
                document.getElementById('sliderComparisonBtn').disabled = false;
                
                // Automatically show the slider comparison view
                this.showSliderComparison();
            };
        };
        reader.readAsDataURL(blob);
    }

    updateCompressedStats(blob) {
        const originalSize = this.originalFile.size;
        const compressedSize = blob.size;
        const compressionRatio = (originalSize / compressedSize).toFixed(2);
        const sizeReduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

        document.getElementById('compressedSize').textContent = this.formatFileSize(compressedSize);
        document.getElementById('compressionRatio').textContent = `${compressionRatio}:1`;
        document.getElementById('sizeReduction').textContent = `${sizeReduction}%`;
        
        // Get compressed image dimensions
        const img = new Image();
        img.onload = () => {
            document.getElementById('compressedDimensions').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
        };
        img.src = URL.createObjectURL(blob);
    }

    downloadCompressed() {
        if (!this.compressedBlob) {
            alert('No compressed image available.');
            return;
        }

        const outputType = document.getElementById('outputType').value;
        const extension = outputType.split('/')[1];
        const filename = `compressed_${Date.now()}.${extension}`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(this.compressedBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
    }
    
    // New methods for comparison tools
    // Update the showSideBySideView method to implement zoom
    showSideBySideView() {
        // Hide other comparison views
        document.getElementById('sliderComparisonView').style.display = 'none';
        
        // Show side by side view
        const sideBySideView = document.getElementById('sideBySideView');
        sideBySideView.style.display = 'flex';
        
        // Set images
        const originalImg = document.getElementById('sideBySideOriginal');
        const compressedImg = document.getElementById('sideBySideCompressed');
        
        // Get the source URLs directly from the original images
        const originalSrc = document.getElementById('originalImage').src;
        const compressedSrc = document.getElementById('compressedImage').src;
        
        // Check if sources exist before setting them
        if (originalSrc && originalSrc !== '') {
            originalImg.src = originalSrc;
        } else {
            console.error('Original image source not available');
        }
        
        if (compressedSrc && compressedSrc !== '') {
            compressedImg.src = compressedSrc;
        } else {
            console.error('Compressed image source not available');
        }
        
        // Initialize zoom functionality after images are loaded
        originalImg.onload = () => {
            // Destroy previous zoom instances if they exist
            if (this.originalZoom) {
                // No direct destroy method in js-image-zoom, so we'll just create a new instance
            }
            
            // Create new zoom instance for original image
            const originalContainer = document.getElementById('originalZoomContainer');
            this.originalZoom = new ImageZoom(originalContainer, {
                width: originalContainer.clientWidth,
                zoomWidth: originalContainer.clientWidth * 1.5,
                zoomPosition: 'original',
                scale: 0.7,
                offset: { vertical: 0, horizontal: 0 }
            });
        };
        
        compressedImg.onload = () => {
            // Destroy previous zoom instances if they exist
            if (this.compressedZoom) {
                // No direct destroy method in js-image-zoom, so we'll just create a new instance
            }
            
            // Create new zoom instance for compressed image
            const compressedContainer = document.getElementById('compressedZoomContainer');
            this.compressedZoom = new ImageZoom(compressedContainer, {
                width: compressedContainer.clientWidth,
                zoomWidth: compressedContainer.clientWidth * 1.5,
                zoomPosition: 'original',
                scale: 0.7,
                offset: { vertical: 0, horizontal: 0 }
            });
        };
    }
    
    // Update the showSliderComparison method to use img-comparison-slider
    showSliderComparison(originalId = 'originalImage', compressedId = 'compressedImage') {
        // Hide other comparison views
        document.getElementById('sideBySideView').style.display = 'none';
        
        // Show slider comparison view
        const sliderView = document.getElementById('sliderComparisonView');
        sliderView.style.display = 'block';
        
        // Set images for the img-comparison-slider
        const originalImg = document.getElementById('sliderOriginalImage');
        const compressedImg = document.getElementById('sliderCompressedImage');
        
        // Get the source URLs directly from the original images
        console.log(originalId, compressedId)
        const originalSrc = document.getElementById(originalId).src;
        const compressedSrc = document.getElementById(compressedId).src;
        
        // Check if sources exist before setting them
        if (originalSrc && originalSrc !== '') {
            originalImg.src = originalSrc;
        } else {
            console.error('Original image source not available');
        }
        
        if (compressedSrc && compressedSrc !== '') {
            compressedImg.src = compressedSrc;
        } else {
            console.error('Compressed image source not available');
        }
    }
     

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }



// New method for browser-image-compression
async compressWithBIC(showResult = true) {
    if (!this.originalFile) {
        alert('Please upload an image first.');
        return;
    }

    const quality = parseFloat(document.getElementById('quality').value);
    const maxWidth = parseInt(document.getElementById('maxWidth').value) || undefined;
    const maxHeight = parseInt(document.getElementById('maxHeight').value) || undefined;
    const outputType = document.getElementById('outputType').value;

    const bicCompressBtn = document.getElementById('bicCompressBtn');
    bicCompressBtn.disabled = true;
    bicCompressBtn.textContent = 'Compressing...';

    try {
        // Configure options for browser-image-compression
        const options = {
            maxSizeMB: 1, // Default max size
            maxWidthOrHeight: Math.max(maxWidth, maxHeight),
            useWebWorker: true,
            initialQuality: quality,
            fileType: outputType
        };

        // Compress the image using browser-image-compression
        const compressedFile = await imageCompression(this.originalFile, options);
        this.bicCompressedBlob = compressedFile;

        if(showResult) {
            this.hideComparisonContainer();
            this.displayBICCompressedImage(compressedFile);
            this.updateBICCompressedStats(compressedFile);
        } 
        
        bicCompressBtn.disabled = false;
        bicCompressBtn.textContent = 'Compress with BIC';
        document.getElementById('downloadBtn').disabled = false;
        
        // Enable comparison if both methods have been used
        if (this.compressedBlob) {
            document.getElementById('compareBtn').disabled = false;
        }
    } catch (error) {
        console.error('BIC Compression failed:', error);
        alert('BIC Compression failed. Please try again.');
        
        bicCompressBtn.disabled = false;
        bicCompressBtn.textContent = 'Compress with BIC';
    }
}

hideComparisonContainer() {
    const container = document.getElementsByClassName('comparison-container')[0];
    if(container) container.style.display = 'none';
}

// Display the BIC compressed image
displayBICCompressedImage(blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const compressedImage = document.getElementById('compressedImage');
        compressedImage.src = e.target.result;
        compressedImage.style.display = 'block';
        
        document.getElementById('compressedStats').style.display = 'block';
        
        // Enable comparison tools only after the image is loaded
        compressedImage.onload = () => {
            document.getElementById('sideBySideBtn').disabled = false;
            document.getElementById('sliderComparisonBtn').disabled = false;
            
            // Automatically show the slider comparison view
            this.showSliderComparison();
        };
    };
    reader.readAsDataURL(blob);
}

// Update stats for BIC compressed image
updateBICCompressedStats(blob) {
    const originalSize = this.originalFile.size;
    const compressedSize = blob.size;
    const compressionRatio = (originalSize / compressedSize).toFixed(2);
    const sizeReduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

    document.getElementById('compressedSize').textContent = this.formatFileSize(compressedSize) + ' (BIC)';
    document.getElementById('compressionRatio').textContent = `${compressionRatio}:1`;
    document.getElementById('sizeReduction').textContent = `${sizeReduction}%`;
    
    // Get compressed image dimensions
    const img = new Image();
    img.onload = () => {
        document.getElementById('compressedDimensions').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
    };
    img.src = URL.createObjectURL(blob);
}

// Compare both compression methods
async compareBothMethods() {
    await this.compressImage(false); // Compress with CompressorJS
    await this.compressWithBIC(false); // Compress with BIC

    document.getElementById('compressedImage').style.display = 'none';
    document.getElementById('compressedStats').style.display = 'none';
        
        // Create a comparison container
        const container = document.createElement('div');
        container.className = 'comparison-container';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '20px';
        container.style.margin = '20px 0';
        container.style.gridColumn = '1 / span 2';
    
        // Create CompressorJS section
        const compressorSection = document.createElement('div');
        compressorSection.innerHTML = `
            <h3>CompressorJS Result</h3>
            <div class="image-preview">
                <img id="compressorResult" alt="CompressorJS Result">
            </div>
            <div class="stats">
                <p>Size: <span id="compressorSize">-</span></p>
                <p>Compression Ratio: <span id="compressorRatio">-</span></p>
                <p>Size Reduction: <span id="compressorReduction">-</span></p>
            </div>
        `;
    
        // Create BIC section
        const bicSection = document.createElement('div');
        bicSection.innerHTML = `
            <h3>Browser Image Compression Result</h3>
            <div class="image-preview">
                <img id="bicResult" alt="BIC Result">
            </div>
            <div class="stats">
                <p>Size: <span id="bicSize">-</span></p>
                <p>Compression Ratio: <span id="bicRatio">-</span></p>
                <p>Size Reduction: <span id="bicReduction">-</span></p>
            </div>
        `;
    
        // Add sections to container
        container.appendChild(compressorSection);
        container.appendChild(bicSection);
    
        // Add container to the document
        const comparisonTools = document.querySelector('.comparison-tools');
        comparisonTools.parentNode.insertBefore(container, comparisonTools.nextSibling);
    
        // Display images and update stats
        const compressorImg = document.getElementById('compressorResult');
        const bicImg = document.getElementById('bicResult');
    
        // Display CompressorJS result
        const compressorReader = new FileReader();
        compressorReader.onload = (e) => {
            compressorImg.src = e.target.result;
            document.getElementById('compressorSize').textContent = this.formatFileSize(this.compressedBlob.size);
            const compressorRatio = (this.originalFile.size / this.compressedBlob.size).toFixed(2);
            const compressorReduction = (((this.originalFile.size - this.compressedBlob.size) / this.originalFile.size) * 100).toFixed(1);
            document.getElementById('compressorRatio').textContent = `${compressorRatio}:1`;
            document.getElementById('compressorReduction').textContent = `${compressorReduction}%`;
        };
        compressorReader.readAsDataURL(this.compressedBlob);
    
        // Display BIC result
        const bicReader = new FileReader();
        bicReader.onload = (e) => {
            bicImg.src = e.target.result;
            document.getElementById('bicSize').textContent = this.formatFileSize(this.bicCompressedBlob.size);
            const bicRatio = (this.originalFile.size / this.bicCompressedBlob.size).toFixed(2);
            const bicReduction = (((this.originalFile.size - this.bicCompressedBlob.size) / this.originalFile.size) * 100).toFixed(1);
            document.getElementById('bicRatio').textContent = `${bicRatio}:1`;
            document.getElementById('bicReduction').textContent = `${bicReduction}%`;
        };
        bicReader.readAsDataURL(this.bicCompressedBlob);
    
        bicReader.onloadend = () => {
            // Show the comparison view
            this.showSliderComparison('compressorResult', 'bicResult');
        };
        

}

}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressionExperiment();
});

// Additional utility functions for advanced experiments
const CompressionUtils = {
    // Compare multiple compression settings
    batchCompress: async function(file, settings) {
        const results = [];
        
        for (const setting of settings) {
            try {
                const result = await new Promise((resolve, reject) => {
                    new Compressor(file, {
                        ...setting,
                        success: resolve,
                        error: reject
                    });
                });
                
                results.push({
                    setting,
                    blob: result,
                    size: result.size,
                    compressionRatio: file.size / result.size
                });
            } catch (error) {
                console.error('Batch compression failed for setting:', setting, error);
            }
        }
        
        return results;
    },
    
    // Generate comparison report
    generateReport: function(originalFile, results) {
        const report = {
            original: {
                size: originalFile.size,
                type: originalFile.type
            },
            compressions: results.map(result => ({
                settings: result.setting,
                size: result.size,
                compressionRatio: result.compressionRatio,
                sizeReduction: ((originalFile.size - result.size) / originalFile.size * 100).toFixed(1) + '%'
            }))
        };
        
        return report;
    },



};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageCompressionExperiment, CompressionUtils };
}

