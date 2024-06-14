// script.js
document.getElementById('imageInput').addEventListener('change', handleFiles);
document.getElementById('convertButton').addEventListener('click', convertImages);

function handleFiles() {
    const fileInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }

    previewContainer.innerHTML = ''; // Clear previous previews
    loadingOverlay.style.display = 'flex';
    let loadedCount = 0;

    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;

            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;

            previewItem.appendChild(img);
            previewItem.appendChild(fileName);
            previewContainer.appendChild(previewItem);

            loadedCount++;
            const progress = Math.round((loadedCount / fileInput.files.length) * 100);
            loadingProgress.style.width = progress + '%';
            loadingText.textContent = `Cargando... ${progress}%`;

            if (loadedCount === fileInput.files.length) {
                loadingOverlay.style.display = 'none';
            }
        }
        reader.readAsDataURL(file);
    });
}

function convertImages() {
    const fileInput = document.getElementById('imageInput');
    const format = document.getElementById('formatSelect').value;
    const canvas = document.getElementById('canvas');
    const previewContainer = document.getElementById('previewContainer');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const zip = new JSZip();
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }

    previewContainer.innerHTML = ''; // Clear previous previews
    downloadAllButton.style.display = 'none';

    loadingOverlay.style.display = 'flex';
    let loadedCount = 0;

    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                // Reduce image size for preview and conversion
                canvas.width = img.width / 2; // Reduce width by half
                canvas.height = img.height / 2; // Reduce height by half
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);

                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';

                    const thumbnail = document.createElement('img');
                    thumbnail.src = event.target.result;

                    const fileName = document.createElement('span');
                    fileName.textContent = file.name;

                    const link = document.createElement('button');
                    link.onclick = function () {
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;
                        const originalFileName = file.name.split('.').slice(0, -1).join('.') + '.' + format;
                        downloadLink.download = originalFileName;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                    };

                    previewItem.appendChild(thumbnail);
                    previewItem.appendChild(fileName);
                    previewItem.appendChild(link);
                    previewContainer.appendChild(previewItem);

                    zip.file(file.name.split('.').slice(0, -1).join('.') + '.' + format, blob);

                    loadedCount++;
                    const progress = Math.round((loadedCount / fileInput.files.length) * 100);
                    loadingProgress.style.width = progress + '%';
                    loadingText.textContent = `Convirtiendo... ${progress}%`;

                    if (loadedCount === fileInput.files.length) {
                        loadingOverlay.style.display = 'none';
                        downloadAllButton.style.display = 'block';
                    }
                }, `image/${format}`);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    // Mueve este event listener fuera del bucle forEach
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
    }, { once: true }); // Usar { once: true } para asegurarse de que el evento se adjunta solo una vez
}

// IntersectionObserver para cargar imágenes solo cuando son visibles
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.onload = () => img.style.opacity = '1';
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('.preview-item img').forEach(img => {
    observer.observe(img);
});
