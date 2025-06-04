# Image Compression Experiment

A web-based tool to experiment with and compare different image compression techniques using CompressorJS.

## Features

- **Interactive UI**: Drag-and-drop or click to upload images
- **Real-time Compression**: Adjust quality, dimensions, and output format
- **Side-by-side Comparison**: View original vs compressed images
- **Detailed Statistics**: File sizes, compression ratios, and size reduction percentages
- **Multiple Formats**: Support for JPEG, PNG, and WebP output
- **Download Capability**: Download compressed images

## Getting Started

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Open `index.html` in a web browser
2. Upload an image by clicking the upload area or dragging and dropping
3. Adjust compression settings and click "Compress Image"
4. Compare results and download if needed

## Compression Settings

### Quality
- Range: 0.1 to 1.0
- Lower values = smaller file size, lower quality
- Higher values = larger file size, better quality

### Dimensions
- Set maximum width and height
- Images will be scaled down proportionally if they exceed these limits

### Output Format
- **JPEG**: Best for photos, lossy compression
- **PNG**: Best for graphics with transparency, lossless compression
- **WebP**: Modern format with excellent compression, supported in modern browsers

## Experiment Ideas

### 1. Quality vs File Size Analysis
Test different quality settings (0.1, 0.3, 0.5, 0.7, 0.9) on the same image:

```javascript
// Open browser console and run:
const settings = [
    { quality: 0.1, mimeType: 'image/jpeg' },
    { quality: 0.3, mimeType: 'image/jpeg' },
    { quality: 0.5, mimeType: 'image/jpeg' },
    { quality: 0.7, mimeType: 'image/jpeg' },
    { quality: 0.9, mimeType: 'image/jpeg' }
];

// Assuming you have uploaded an image
CompressionUtils.batchCompress(app.originalFile, settings)
    .then(results => {
        const report = CompressionUtils.generateReport(app.originalFile, results);
        console.table(report.compressions);
    });
```

### 2. Format Comparison
Compare the same image compressed with different formats:

```javascript
const formatSettings = [
    { quality: 0.8, mimeType: 'image/jpeg' },
    { quality: 0.8, mimeType: 'image/png' },
    { quality: 0.8, mimeType: 'image/webp' }
];

CompressionUtils.batchCompress(app.originalFile, formatSettings)
    .then(results => {
        console.log('Format comparison:');
        results.forEach(result => {
            console.log(`${result.setting.mimeType}: ${(result.size / 1024).toFixed(1)} KB`);
        });
    });
```

### 3. Dimension vs Quality Trade-off
Test how resizing affects compression efficiency:

```javascript
const dimensionSettings = [
    { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
    { quality: 0.8, maxWidth: 1280, maxHeight: 720 },
    { quality: 0.8, maxWidth: 800, maxHeight: 600 },
    { quality: 0.8, maxWidth: 400, maxHeight: 300 }
];
```

### 4. Optimal Settings Finder
Find the best quality setting for a target file size:

```javascript
function findOptimalQuality(targetSizeKB) {
    const targetBytes = targetSizeKB * 1024;
    const qualities = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    
    // Test each quality and find the one closest to target size
    // Implementation left as exercise
}
```

## Advanced Experiments

### Batch Processing
Use the included `CompressionUtils` for advanced experiments:

- **A/B Testing**: Compare different compression algorithms
- **Performance Analysis**: Measure compression time vs file size
- **Quality Metrics**: Implement PSNR or SSIM comparisons
- **User Preference Studies**: Test which compression settings users prefer

### Image Types Analysis
Test how different types of images respond to compression:

- **Photographs**: High detail, many colors
- **Graphics**: Few colors, sharp edges
- **Screenshots**: Text and UI elements
- **Artwork**: Various styles and complexities

## Browser Compatibility

- **CompressorJS**: Works in all modern browsers
- **WebP Support**: Chrome, Firefox, Safari (14+), Edge
- **File API**: Required for file upload/download functionality

## Technical Details

### Dependencies
- [CompressorJS](https://github.com/fengyuanchen/compressorjs): Client-side image compression library

### Key Features of CompressorJS
- Uses HTML5 Canvas for compression
- Maintains image orientation
- Supports quality adjustment
- Can resize images
- Converts between formats

## Project Structure

```
image-compression-experiment/
├── index.html          # Main HTML file with UI
├── script.js           # JavaScript functionality
├── package.json        # Node.js dependencies
├── README.md          # This file
└── node_modules/      # Installed packages
```

## Future Enhancements

- [ ] Add more compression libraries (e.g., browser-image-compression)
- [ ] Implement batch processing UI
- [ ] Add image quality metrics (PSNR, SSIM)
- [ ] Create comparison charts and graphs
- [ ] Add preset compression profiles
- [ ] Implement before/after image viewer with slider
- [ ] Add support for animated images (GIF, WebP)
- [ ] Create automated testing suite

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this experiment tool.

## License

MIT License - Feel free to use this for educational and commercial purposes.

