class Uploader {
  constructor(name, previewCallback, multiple = true) {
    this.name = name;
    this.previewCallback = previewCallback;
    this.multiple = multiple;
  }

  createUploader(container = document.body) {
    this.setupUploader(container);
    this.setupEventListeners();
  }

  setupUploader(container) {
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add('upload-container');

    const dropZone = document.createElement('div');
    dropZone.className = 'upload-dropzone';

    const dropZoneText = document.createElement('div');
    dropZoneText.className = 'dropzone-text';
    dropZoneText.innerHTML = `drop your <b>${this.name ?? 'images'}</b> here`;

    const inputLabel = document.createElement('label');
    inputLabel.className = 'input-label';
    inputLabel.textContent = 'or ';

    const selectButton = document.createElement('div');
    selectButton.className = 'select-button';
    selectButton.textContent = `select ${this.name ?? 'images'}`;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = this.multiple;
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*';

    const fileList = document.createElement('div');
    fileList.classList.add('files-list');

    inputLabel.appendChild(selectButton);
    inputLabel.appendChild(fileInput);

    dropZone.appendChild(dropZoneText);
    dropZone.appendChild(inputLabel);

    uploadContainer.appendChild(dropZone);
    uploadContainer.appendChild(fileList);

    this.uploadContainer = uploadContainer;
    this.dropZone = dropZone;
    this.fileInput = fileInput;
    this.fileList = fileList;

    container.appendChild(uploadContainer);
  }

  createImagePreview(file) {
    const img = document.createElement('img');
    img.classList.add('file-preview');

    img.dataset.name = file.name;
    img.dataset.type = file.type;

    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    img.addEventListener('click', () => {
      this.previewCallback(img.src);
    });

    return img;
  }

  getImages() {
    return this.fileList.querySelectorAll('img');
  }

  setupEventListeners() {
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, preventDefaults, false);
    });

    // highlight dropzone when dragging over
    ['dragenter', 'dragover'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, () => this.dropArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      this.dropZone.addEventListener(eventName, () => this.dropArea.classList.remove('drag-over'), false);
    });

    // handle files
    const handleFiles = (files) => {
      for (const file of files) {
        const listImg = this.createImagePreview(file);

        if (!this.multiple) {
          this.fileList.innerHTML = '';
          this.fileList.appendChild(listImg);
          break;
        }

        this.fileList.appendChild(listImg);
      }
    };

    const handleDrop = (e) => {
      const files = e.dataTransfer.files;
      handleFiles(files);
    };

    // handel selected files
    this.fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      handleFiles(files);
    });

    // handle dropped files
    this.dropZone.addEventListener('drop', handleDrop, false);
  }
}

export default Uploader;
