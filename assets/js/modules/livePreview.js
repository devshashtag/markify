class livePreview {
  constructor(container, defaultImage = '/assets/images/placeholder.jpg', defaultWatermark = '/assets/images/watermark.png') {
    this.container = container;

    // load image
    this.image = new Image();
    this.image.src = defaultImage;

    // load watermark
    this.watermark = new Image();
    this.watermark.src = defaultWatermark;

    // image settings
    this.paddingInlineInput = this.container.querySelector('#padding-inline');
    this.paddingBlockInput = this.container.querySelector('#padding-block');
    this.paddingColorInput = this.container.querySelector('#padding-color');
    this.responsivePaddingInput = this.container.querySelector('#responsive-padding');

    // watermark settings
    this.positionSelect = this.container.querySelector('#watermark-position');
    this.offsetXInput = this.container.querySelector('#offset-x');
    this.offsetYInput = this.container.querySelector('#offset-y');
    this.scaleInput = this.container.querySelector('#watermark-scale');
    this.opacityInput = this.container.querySelector('#watermark-opacity');

    // preview
    this.previewCanvas = this.container.querySelector('#preview-canvas');

    // setup events
    this.setupEventListeners();
    this.update();
  }

  setupEventListeners() {
    // image
    this.paddingInlineInput.addEventListener('input', () => this.update());
    this.paddingBlockInput.addEventListener('input', () => this.update());
    this.paddingColorInput.addEventListener('input', () => this.update());
    this.responsivePaddingInput.addEventListener('input', () => this.update());

    // watermark
    this.positionSelect.addEventListener('change', () => this.update());
    this.offsetXInput.addEventListener('input', () => this.update());
    this.offsetYInput.addEventListener('input', () => this.update());
    this.scaleInput.addEventListener('input', () => this.update());
    this.opacityInput.addEventListener('input', () => this.update());
  }

  setImage(src) {
    this.image.src = src;
    this.image.onload = () => {
      this.update();
    };
  }

  setWatermark(src) {
    this.watermark.src = src;
    this.watermark.onload = () => {
      this.update();
    };
  }

  update() {
    if (!this.image.complete && !this.watermark.complete) {
      setTimeout(() => this.update(), 100);
      return;
    }

    const ctx = this.previewCanvas.getContext('2d');
    let paddingInline = +this.paddingInlineInput.value ?? 10;
    let paddingBlock = +this.paddingBlockInput.value ?? 10;
    const responsivePadding = this.responsivePaddingInput.checked ?? true;
    const paddingColor = this.paddingColorInput.value ?? '#4e4e4e';
    const position = this.positionSelect.value ?? 'top';
    const offsetX = +this.offsetXInput.value ?? 0;
    const offsetY = +this.offsetYInput.value ?? 0;
    const scaleFactor = parseFloat(this.scaleInput.value ?? 20) / 100;
    const opacity = parseFloat(this.opacityInput.value ?? 1);

    // scale watermark size based on image
    const widthRatio = (this.image.width * scaleFactor) / this.watermark.width;
    const heightRatio = (this.image.height * scaleFactor) / this.watermark.height;
    const scale = Math.min(widthRatio, heightRatio);

    // scale padding based on image
    if (responsivePadding) {
      const paddingScale = Math.min(this.image.width / 100, this.image.height / 100);
      paddingInline *= paddingScale;
      paddingBlock *= paddingScale;
    }

    // update the image
    // calculate canvas size with padding
    const canvasWidth = this.image.width + 2 * paddingInline;
    const canvasHeight = this.image.height + 2 * paddingBlock;

    // resize the canvas to fit the image and padding
    this.previewCanvas.width = canvasWidth;
    this.previewCanvas.height = canvasHeight;

    // clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // draw padding
    ctx.fillStyle = paddingColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // draw the image with padding
    ctx.drawImage(this.image, paddingInline, paddingBlock, this.image.width, this.image.height);

    // update the watermark
    const watermarkWidth = Math.round(this.watermark.width * scale);
    const watermarkHeight = Math.round(this.watermark.height * scale);

    // calculate watermark position based on the selected value
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
        x = (canvasWidth - watermarkWidth) / 2 + offsetX;
        y = (canvasHeight - watermarkHeight) / 2 + offsetY;
        break;
    }

    // draw the watermark with opacity
    ctx.globalAlpha = opacity;
    ctx.drawImage(this.watermark, x, y, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1.0; // reset global alpha
  }
}

export default livePreview;
