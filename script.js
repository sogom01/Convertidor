// script.js
document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('imageInput');
    const format = document.getElementById('formatSelect').value;
    const canvas = document.getElementById('canvas');
    const downloadLinks = document.getElementById('downloadLinks');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const zip = new JSZip();

    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }

    downloadLinks.innerHTML = '';
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
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `converted-image-${index + 1}.${format}`;
                    link.textContent = `Descargar Imagen Convertida ${index + 1}`;
                    downloadLinks.appendChild(link);
                    zip.file(`converted-image-${index + 1}.${format}`, blob);
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
            zipLink.download = "converted-images.zip";
            zipLink.click();
        });
    });
});
