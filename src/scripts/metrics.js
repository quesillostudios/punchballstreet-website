document.addEventListener('DOMContentLoaded', function() {
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbzSLZSk1hbO-Cv0oi4J-px2EoOz4dN5UjUSG3xiC5tCHvbKWHkehuWjIwIgsrk1KEWrYQ/exec';
    const metricsToken = 'pdQyvCyfZxasaGAh';
    const METRIC_COOLDOWN = 10000;

    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        const downloadLink = downloadButton.querySelector('a');
        const targetElement = downloadLink || downloadButton;

        targetElement.addEventListener('click', function() {
            console.log('Botón de descarga clickeado...');
            sendMetric('DownloadClick'); // Intenta enviar la métrica
        });
    } else {
        console.warn('Elemento con id "downloadButton" no encontrado.');
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('source') && urlParams.get('source') === 'qr') {
        console.log('Visita detectada desde QR. Enviando métrica e iniciando descarga...');

        sendMetric('QRScan');

        history.replaceState(null, '', window.location.pathname);

        const downloadLinkElement = document.querySelector('#downloadButton a');
        let downloadUrl = 'https://punchball.s3.us-east-005.dream.io/builds/punchball_street_019.apk'; // Fallback

        if (downloadLinkElement && downloadLinkElement.href) {
            downloadUrl = downloadLinkElement.href;
        } else {
            console.warn('No se pudo encontrar el enlace de descarga principal. Usando fallback.');
        }

        console.log('Iniciando descarga desde:', downloadUrl);
        window.location.href = downloadUrl;
    }

    function sendMetric(eventType) {
        const now = new Date().getTime();
        const lastMetricTime = sessionStorage.getItem(`metric_${eventType}_time`);

        if (lastMetricTime && (now - lastMetricTime < METRIC_COOLDOWN)) {
            console.warn(`Métrica '${eventType}' está en cooldown. Ignorando.`);
            return;
        }

        if (!webAppUrl || webAppUrl === '') {
            console.error('URL del Web App no configurada en metrics.js');
            return;
        }

        const urlWithParams = `${webAppUrl}?eventType=${encodeURIComponent(eventType)}&token=${encodeURIComponent(metricsToken)}`;

        try {
            sessionStorage.setItem(`metric_${eventType}_time`, now);

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