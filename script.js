// script.js
document.getElementById('imageInput').addEventListener('change', handleFiles);
document.getElementById('convertButton').addEventListener('click', convertImages);

function handleFiles() {
    const fileInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = ''; // Clear previous previews

    Array.from(fileInput.files).forEach((file) => {
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

    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }

    previewContainer.innerHTML = ''; // Clear previous previews
    downloadAllButton.style.display = 'none';

    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);

                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';

                    const thumbnail = document.createElement('img');
                    thumbnail.src = event.target.result;

                    const fileName = document.createElement('span');
                    fileName.textContent = file.name;

                    const link = document.createElement('button');
                    link.textContent = 'Descargar';
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
                }, `image/${format}`);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    downloadAllButton.style.display = 'block';
    downloadAllButton.addEventListener('click', () => {
        zip.generateAsync({ type: "blob" }).then((content) => {
            const zipLink = document.createElement('a');
            zipLink.href = URL.createObjectURL(content);
            zipLink.download = "convert-img.zip";
            document.body.appendChild(zipLink);
            zipLink.click();
            document.body.removeChild(zipLink);
        });
    });
}
