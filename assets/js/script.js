import livePreview from './modules/livePreview.js';
import Uploader from './modules/uploader.js';

document.addEventListener('DOMContentLoaded', () => {
  const settingsPanel = document.getElementById('settings-panel');
  const inputContainer = document.getElementById('container-input');
  const downloadButton = document.getElementById('download-button');

  const settings = new livePreview(settingsPanel);
  const setWatermark = settings.setWatermark.bind(settings);
  const setImage = settings.setImage.bind(settings);

  // uploaders
  const watermarkUploader = new Uploader('watermarks', setWatermark);
  watermarkUploader.createUploader(inputContainer);
  const imagesUploader = new Uploader('images', setImage);
  imagesUploader.createUploader(inputContainer);

  async function downloadAllImages() {
    downloadButton.innerText = 'markify and compressing....';
    const processedImages = await settings.markifyAllImages(imagesUploader.getImages());

    await settings.downloadAllImages(processedImages);
    downloadButton.innerText = 'download all images';
  }

  downloadButton.addEventListener('click', downloadAllImages);
});
