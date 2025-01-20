class LivePreview {
  constructor(container, defaultImage = 'assets/images/placeholder.webp', defaultWatermark = 'assets/images/watermark.webp') {
    this.container = container;

    // load image
    this.image = new Image();
    this.image.src = defaultImage;

    // load watermark
    this.watermark = new Image();
    this.watermark.src = defaultWatermark;

    // image settings
    this.paddingInlineInput = document.getElementById('padding-inline');
    this.paddingBlockInput = document.getElementById('padding-block');
    this.paddingColorInput = document.getElementById('padding-color');
    this.responsivePaddingInput = document.getElementById('responsive-padding');

    // watermark settings
    this.positionSelect = document.getElementById('watermark-position');
    this.offsetXInput = document.getElementById('offset-x');
    this.offsetYInput = document.getElementById('offset-y');
    this.scaleInput = document.getElementById('watermark-scale');
    this.opacityInput = document.getElementById('watermark-opacity');

    // preview
    this.previewCanvas = document.getElementById('preview-canvas');

    // set up event listeners
    this.container.addEventListener('input', () => this.update());

    this.update();
  }

  setImage(src) {
    this.image.src = src;
    this.image.onload = () => this.update();
  }

  setWatermark(src) {
    this.watermark.src = src;
    this.watermark.onload = () => this.update();
  }

  getOptions() {
    return {
      paddingInline: +(this.paddingInlineInput?.value ?? 0),
      paddingBlock: +(this.paddingBlockInput?.value ?? 0),
      responsivePadding: this.responsivePaddingInput?.checked ?? true,
      paddingColor: this.paddingColorInput?.value ?? '#4e4e4e',
      position: this.positionSelect?.value ?? 'center',
      offsetX: +(this.offsetXInput?.value ?? 0),
      offsetY: +(this.offsetYInput?.value ?? 0),
      scaleFactor: parseFloat(this.scaleInput?.value ?? 20) / 100,
      opacity: parseFloat(this.opacityInput?.value ?? 1),
    };
  }

  // adjust padding based on image size if responsive
  calculatePadding(baseImage, paddingInline, paddingBlock, responsivePadding) {
    if (!responsivePadding) {
      return { adjustedPaddingInline: paddingInline, adjustedPaddingBlock: paddingBlock };
    }

    // calculate a scaling factor based on the base image dimensions
    const paddingScale = Math.min(baseImage.naturalWidth / 100, baseImage.naturalHeight / 100);

    // adjust padding values based on the scaling factor
    return {
      adjustedPaddingInline: paddingInline * paddingScale,
      adjustedPaddingBlock: paddingBlock * paddingScale,
    };
  }

  // calculate watermark size based on baseimage size and scalefactor
  calculateWatermarkSize(scaleFactor, baseImage, watermarkImage) {
    // calculate the scaling ratios for width and height
    const widthRatio = (baseImage.naturalWidth * scaleFactor) / watermarkImage.naturalWidth;
    const heightRatio = (baseImage.naturalHeight * scaleFactor) / watermarkImage.naturalHeight;

    // use the smaller ratio to ensure the watermark fits within the base image
    const scale = Math.min(widthRatio, heightRatio);

    // calculate and return the scaled dimensions
    return {
      watermarkWidth: Math.round(watermarkImage.naturalWidth * scale),
      watermarkHeight: Math.round(watermarkImage.naturalHeight * scale),
    };
  }

  // calculate watermark position based on the selected value
  calculateWatermarkPosition(position, canvasWidth, canvasHeight, watermarkWidth, watermarkHeight, offsetX, offsetY) {
    let x, y;

    switch (position) {
      case 'top':
        x = (canvasWidth - watermarkWidth) / 2 + offsetX;
        y = offsetY;
        break;
      case 'bottom':
        x = (canvasWidth - watermarkWidth) / 2 + offsetX;
        y = canvasHeight - watermarkHeight - offsetY;
        break;
      case 'left':
        x = offsetX;
        y = (canvasHeight - watermarkHeight) / 2 + offsetY;
        break;
      case 'right':
        x = canvasWidth - watermarkWidth - offsetX;
        y = (canvasHeight - watermarkHeight) / 2 + offsetY;
        break;
      case 'top-left':
        x = offsetX;
        y = offsetY;
        break;
      case 'top-right':
        x = canvasWidth - watermarkWidth - offsetX;
        y = offsetY;
        break;
      case 'bottom-left':
        x = offsetX;
        y = canvasHeight - watermarkHeight - offsetY;
        break;
      case 'bottom-right':
        x = canvasWidth - watermarkWidth - offsetX;
        y = canvasHeight - watermarkHeight - offsetY;
        break;
      case 'center':
      default:
        x = (canvasWidth - watermarkWidth) / 2 + offsetX;
        y = (canvasHeight - watermarkHeight) / 2 + offsetY;
        break;
    }

    return { x, y };
  }

  update() {
    if (!this.image.complete || !this.watermark.complete) {
      setTimeout(() => this.update(), 100);
      return;
    }

    const ctx = this.previewCanvas.getContext('2d');
    const options = this.getOptions();

    // calculate watermark size based on image
    const { watermarkWidth, watermarkHeight } = this.calculateWatermarkSize(options.scaleFactor, this.image, this.watermark);

    // adjust padding based on image size if responsive
    const { adjustedPaddingInline, adjustedPaddingBlock } = this.calculatePadding(
      this.image,
      options.paddingInline,
      options.paddingBlock,
      options.responsivePadding
    );

    // resize the canvas to fit the image and padding
    const canvasWidth = this.image.naturalWidth + 2 * adjustedPaddingInline;
    const canvasHeight = this.image.naturalHeight + 2 * adjustedPaddingBlock;
    this.previewCanvas.width = canvasWidth;
    this.previewCanvas.height = canvasHeight;

    // clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // draw padding
    ctx.fillStyle = options.paddingColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // draw the image with padding
    ctx.drawImage(this.image, adjustedPaddingInline, adjustedPaddingBlock, this.image.naturalWidth, this.image.naturalHeight);

    // calculate watermark position based on the selected value
    const { x, y } = this.calculateWatermarkPosition(
      options.position,
      canvasWidth,
      canvasHeight,
      watermarkWidth,
      watermarkHeight,
      options.offsetX,
      options.offsetY
    );

    // draw the watermark with opacity
    ctx.globalAlpha = options.opacity;
    ctx.drawImage(this.watermark, x, y, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1.0; // reset global alpha
  }

  canvasToBlob(canvas, type = 'image/png', quality = 1) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to convert canvas to Blob.'))), type, quality);
    });
  }

  async markifyAllImages(images, watermarkImage = this.watermark, quality = 1) {
    const options = this.getOptions();
    const processedImages = [];

    for (const baseImage of images) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // calculate watermark size based on image
      const { watermarkWidth, watermarkHeight } = this.calculateWatermarkSize(options.scaleFactor, baseImage, watermarkImage);

      // adjust padding based on image size if responsive
      const { adjustedPaddingInline, adjustedPaddingBlock } = this.calculatePadding(
        baseImage,
        options.paddingInline,
        options.paddingBlock,
        options.responsivePadding
      );

      // resize the canvas to fit the image and padding
      const canvasWidth = baseImage.naturalWidth + 2 * adjustedPaddingInline;
      const canvasHeight = baseImage.naturalHeight + 2 * adjustedPaddingBlock;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // clear the canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // draw padding
      ctx.fillStyle = options.paddingColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // draw the image with padding
      ctx.drawImage(baseImage, adjustedPaddingInline, adjustedPaddingBlock, baseImage.naturalWidth, baseImage.naturalHeight);

      // calculate watermark position based on the selected value
      const { x, y } = this.calculateWatermarkPosition(
        options.position,
        canvasWidth,
        canvasHeight,
        watermarkWidth,
        watermarkHeight,
        options.offsetX,
        options.offsetY
      );

      // draw the watermark with opacity
      ctx.globalAlpha = options.opacity;
      ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0; // reset global alpha

      // convert the canvas content to a data url or blob
      const type = baseImage.dataset.type || 'image/png';
      const blob = await this.canvasToBlob(canvas, type, quality);

      // save the processed image
      processedImages.push({
        name: baseImage.dataset.name || `image-${Date.now()}.${type.split('/')[1]}`,
        blob,
      });
    }

    return processedImages;
  }

  async downloadAllImages(processedImages, zipFileName = 'markify-images.zip') {
    const zip = new JSZip();

    processedImages.forEach((image) => {
      zip.file(image.name, image.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFileName;
    link.click();
  }
}

export default LivePreview;
