class Uploader {
  constructor(name, previewCallback, multiple = true) {
    this.name = name;
    this.previewCallback = previewCallback;
    this.multiple = multiple;
    this.files = [];
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

  createCanvasPreview(file) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);

    return canvas;
  }

  createListItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.classList.add('file-preview');

    fileItem.dataset.index = index;
    fileItem.addEventListener('click', () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewCallback(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    const canvasPreview = this.createCanvasPreview(file);

    fileItem.appendChild(canvasPreview);

    return fileItem;
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
        if (this.multiple) {
          const index = this.files.push(file);
          const listItem = this.createListItem(file, index - 1);

          this.fileList.appendChild(listItem);
        } else {
          this.files = [file];
          this.fileList.innerHTML = '';
          const listItem = this.createListItem(file, 0);

          this.fileList.appendChild(listItem);
          break;
        }
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
