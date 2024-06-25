// script.js
document.getElementById('imageInput').addEventListener('change', handleFiles);
document.getElementById('convertButton').addEventListener('click', convertImages);
document.getElementById('qualityRange').addEventListener('input', updateQualityValue);
document.getElementById('renameButton').addEventListener('click', renameFiles);
document.getElementById('clearHistoryButton').addEventListener('click', clearHistory);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('reloadButton').addEventListener('click', () => location.reload());

const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);

const dimensionSelect = document.getElementById('dimensionSelect');
dimensionSelect.addEventListener('change', handleDimensionSelect);

let files = [];

function handleFiles(event) {
    const newFiles = event.target.files ? [...event.target.files] : [...event.dataTransfer.files];
    files = [...files, ...newFiles];
    previewFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(event);
}

function handleDimensionSelect() {
    const customDimensions = document.querySelector('.custom-dimensions');
    if (dimensionSelect.value === 'custom') {
        customDimensions.classList.remove('hidden');
    } else {
        customDimensions.classList.add('hidden');
    }
}

function updateQualityValue() {
    document.getElementById('qualityValue').textContent = document.getElementById('qualityRange').value;
}

function previewFiles(files) {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;

            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M19 13H5v-2h14v2zm0 0H5v-2h14v2z" /></svg>`;
            deleteButton.onclick = function () {
                files.splice(index, 1);
                previewFiles(files);
            };

            const downloadButton = document.createElement('button');
            downloadButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zm0 2c.554 0 1.077-.22 1.47-.613.394-.394.613-.916.613-1.47s-.22-1.077-.613-1.47C13.077 14.22 12.554 14 12 14s-1.077.22-1.47.613c-.394.394-.613.916-.613 1.47s.22 1.077.613 1.47C10.923 17.78 11.446 18 12 18z"/></svg>`;
            downloadButton.onclick = function () {
                const downloadLink = document.createElement('a');
                downloadLink.href = event.target.result;
                downloadLink.download = file.name;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };

            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(downloadButton);

            previewItem.appendChild(img);
            previewItem.appendChild(fileName);
            previewItem.appendChild(buttonContainer);
            previewContainer.appendChild(previewItem);
        }
        reader.readAsDataURL(file);
    });
}

function convertImages() {
    const formats = Array.from(document.querySelectorAll('#formatSelect input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const keepDimensions = document.getElementById('keepDimensions').checked;
    const dimensionSelectValue = document.getElementById('dimensionSelect').value;
    const customWidth = dimensionSelectValue === 'custom' ? parseInt(document.getElementById('customWidth').value) : parseInt(dimensionSelectValue.split('x')[0]);
    const customHeight = dimensionSelectValue === 'custom' ? parseInt(document.getElementById('customHeight').value) : parseInt(dimensionSelectValue.split('x')[1]);
    const quality = parseFloat(document.getElementById('qualityRange').value);
    const canvas = document.getElementById('canvas');
    const previewContainer = document.getElementById('previewContainer');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const zip = new JSZip();
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    if (files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }

    if (formats.length === 0) {
        alert('Por favor, selecciona al menos un formato de salida.');
        return;
    }

    previewContainer.innerHTML = ''; // Clear previous previews
    downloadAllButton.classList.add('hidden');

    loadingOverlay.style.display = 'flex';
    let loadedCount = 0;

    files.forEach((file, fileIndex) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                formats.forEach((format, formatIndex) => {
                    if (!keepDimensions) {
                        // Resize image to custom dimensions
                        canvas.width = customWidth;
                        canvas.height = customHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    } else {
                        // Keep original dimensions
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);

                        const previewItem = document.createElement('div');
                        previewItem.className = 'preview-item';

                        const thumbnail = document.createElement('img');
                        thumbnail.src = event.target.result;

                        const fileName = document.createElement('span');
                        fileName.textContent = `${file.name.split('.').slice(0, -1).join('.')}.${format}`;

                        const buttonContainer = document.createElement('div');
                        buttonContainer.className = 'button-container';

                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M19 13H5v-2h14v2zm0 0H5v-2h14v2z" /></svg>`;
                        deleteButton.onclick = function () {
                            files.splice(fileIndex, 1);
                            previewFiles(files);
                        };

                        const link = document.createElement('button');
                        link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zm0 2c.554 0 1.077-.22 1.47-.613.394-.394.613-.916.613-1.47s-.22-1.077-.613-1.47C13.077 14.22 12.554 14 12 14s-1.077.22-1.47.613c-.394.394-.613.916-.613 1.47s.22 1.077.613 1.47C10.923 17.78 11.446 18 12 18z"/></svg>`;
                        link.onclick = function () {
                            const downloadLink = document.createElement('a');
                            downloadLink.href = url;
                            const originalFileName = `${file.name.split('.').slice(0, -1).join('.')}.${format}`;
                            downloadLink.download = originalFileName;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                        };

                        buttonContainer.appendChild(deleteButton);
                        buttonContainer.appendChild(link);

                        previewItem.appendChild(thumbnail);
                        previewItem.appendChild(fileName);
                        previewItem.appendChild(buttonContainer);
                        previewContainer.appendChild(previewItem);

                        zip.file(`${file.name.split('.').slice(0, -1).join('.')}.${format}`, blob);

                        loadedCount++;
                        const progress = Math.round((loadedCount / (files.length * formats.length)) * 100);
                        loadingProgress.style.width = progress + '%';
                        loadingText.textContent = `Convirtiendo... ${progress}%`;

                        if (loadedCount === files.length * formats.length) {
                            loadingOverlay.style.display = 'none';
                            downloadAllButton.classList.remove('hidden');
                            document.getElementById('renameButton').classList.remove('hidden');
                            document.getElementById('clearHistoryButton').classList.remove('hidden');
                            document.getElementById('reloadButton').classList.remove('hidden');
                            updateConversionHistory(files, formats);
                        }
                    }, `image/${format}`, quality);
                });
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    downloadAllButton.addEventListener('click', () => {
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = 'Generando ZIP...';
        loadingProgress.style.width = '0%';

        zip.generateAsync({ type: "blob" }, (metadata) => {
            const progress = Math.round((metadata.percent / 100) * 100);
            loadingProgress.style.width = progress + '%';
            loadingText.textContent = `Generando ZIP... ${progress}%`;
        }).then((content) => {
            loadingOverlay.style.display = 'none';
            const zipLink = document.createElement('a');
            zipLink.href = URL.createObjectURL(content);
            zipLink.download = "converted-images.zip";
            document.body.appendChild(zipLink);
            zipLink.click();
            document.body.removeChild(zipLink);
        });
    }, { once: true });
}

function renameFiles() {
    const newName = prompt('Introduce el nuevo nombre base para los archivos:');
    if (!newName) return;

    const previewContainer = document.getElementById('previewContainer');
    const previewItems = previewContainer.getElementsByClassName('preview-item');
    Array.from(previewItems).forEach((item, index) => {
        const fileName = item.querySelector('span');
        fileName.textContent = `${newName}.${index + 1}.` + fileName.textContent.split('.').pop();
    });
}

function updateConversionHistory(files, formats) {
    const historyContainer = document.getElementById('historyContainer');
    const conversionHistory = document.getElementById('conversionHistory');
    historyContainer.classList.remove('hidden');

    files.forEach(file => {
        formats.forEach(format => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = `Archivo: ${file.name}, Formato: ${format}`;
            conversionHistory.appendChild(historyItem);
        });
    });
}

function clearHistory() {
    const conversionHistory = document.getElementById('conversionHistory');
    conversionHistory.innerHTML = '';
    document.getElementById('historyContainer').classList.add('hidden');
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.classList.remove(currentTheme);
    body.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    themeIcon.classList.toggle('fa-sun');
    themeIcon.classList.toggle('fa-moon');
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeIcon = document.getElementById('themeIcon');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        if (savedTheme === 'dark') {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        const initialTheme = prefersDarkScheme ? 'dark' : 'light';
        document.body.classList.add(initialTheme);
        if (initialTheme === 'dark') {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

setInitialTheme();
