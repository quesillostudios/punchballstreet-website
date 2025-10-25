document.addEventListener('DOMContentLoaded', function() {
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbzSLZSk1hbO-Cv0oi4J-px2EoOz4dN5UjUSG3xiC5tCHvbKWHkehuWjIwIgsrk1KEWrYQ/exec';
    const metricsToken = 'pdQyvCyfZxasaGAh';

    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        const downloadLink = downloadButton.querySelector('a');
        const targetElement = downloadLink || downloadButton;

        targetElement.addEventListener('click', function() {
            console.log('Botón de descarga clickeado. Enviando métrica...');
            sendMetric('DownloadClick');
        });
    } else {
        console.warn('Elemento con id "downloadButton" no encontrado.');
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('source') && urlParams.get('source') === 'qr') {
        console.log('Visita detectada desde QR. Enviando métrica...');
        sendMetric('QRScan');

        history.replaceState(null, '', window.location.pathname);
    }

    function sendMetric(eventType) {
        if (!webAppUrl || webAppUrl === 'https://script.google.com/macros/s/AKfycbzSLZSk1hbO-Cv0oi4J-px2EoOz4dN5UjUSG3xiC5tCHvbKWHkehuWjIwIgsrk1KEWrYQ/exec') {
            console.error('URL del Web App no configurada en metrics.js');
            return;
        }

        const urlWithParams = `${webAppUrl}?eventType=${encodeURIComponent(eventType)}&token=${encodeURIComponent(metricsToken)}`;

        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(urlWithParams);
                console.log(`Métrica '${eventType}' enviada (sendBeacon).`);
            } else {
                fetch(urlWithParams, { method: 'GET', mode: 'no-cors', keepalive: true })
                    .then(() => {
                        console.log(`Métrica '${eventType}' enviada (fetch).`);
                    })
                    .catch(error => {
                    });
            }
        } catch (e) {
            console.error('Error al enviar la métrica:', e);
        }
    }

    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) {
        const pageUrlWithParam = `${window.location.origin}${window.location.pathname}?source=qr`;

        qrContainer.setAttribute('data-qr-link', pageUrlWithParam);

        if (window.generateQRCode && qrContainer.querySelector('#qr-placeholder canvas, #qr-placeholder img')) {
            console.log('Regenerando QR con enlace de seguimiento:', pageUrlWithParam);

            const placeholder = document.getElementById('qr-placeholder');
            if (placeholder) placeholder.innerHTML = '';

            window.generateQRCode(pageUrlWithParam)
                .catch(err => console.error("Error al regenerar QR:", err));
        }
    }
});