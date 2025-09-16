(function () {
    // Por defecto usa el contenedor con id 'qr-container' y el placeholder 'qr-placeholder'
    const DEFAULT_CONTAINER_ID = "qr-container";
    const DEFAULT_PLACEHOLDER_ID = "qr-placeholder";

    function getContainerElements(containerId = DEFAULT_CONTAINER_ID) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        const placeholder = container.querySelector(`#${DEFAULT_PLACEHOLDER_ID}`);
        return { container, placeholder };
    }

    function clearPlaceholder(placeholder) {
        if (!placeholder) return;
        while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
    }

    // options: { width, height, colorDark, colorLight, margin }
    function generateQRCode(link, options = {}, containerId = DEFAULT_CONTAINER_ID) {
        const els = getContainerElements(containerId);
        if (!els || !els.placeholder) return Promise.reject(new Error("Contenedor QR no encontrado"));
        const placeholder = els.placeholder;
        clearPlaceholder(placeholder);

        // Opciones por defecto razonables
        const opts = Object.assign(
            {
                width: 120,
                height: 120,
                colorDark: "#000000",
                colorLight: "#ffffff",
                margin: 1,
            },
            options
        );

        // QRCode.toCanvas API (la librería qrcode.min.js soporta toCanvas / toDataURL)
        return new Promise((resolve, reject) => {
            // Si la librería global QRCode no existe, rechaza
            if (typeof QRCode === "undefined" && typeof window.QRCode === "undefined" && typeof qrcode === "undefined") {
                reject(new Error("Librería QR no encontrada. Asegúrate de incluir qrcode.min.js antes de este script."));
                return;
            }

            // Algunos builds exponen `QRCode` y otros `qrcode`. Intentamos usar toCanvas disponible.
            const lib = window.QRCode || window.qrcode || window.qrcodegen || null;

            // La versión que usamos (qrcode@1.5.1) expone QRCode.toCanvas (global QRCode)
            if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
                const canvas = document.createElement("canvas");
                canvas.width = opts.width;
                canvas.height = opts.height;
                QRCode.toCanvas(canvas, link, { width: opts.width, margin: opts.margin, color: { dark: opts.colorDark, light: opts.colorLight } }, function (error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    placeholder.appendChild(canvas);
                    resolve(canvas);
                });
                return;
            }

            // Fallback: intentar usar qrcode.toDataURL
            if (window.qrcode && typeof window.qrcode.toDataURL === "function") {
                qrcode.toDataURL(link, { width: opts.width }, function (err, url) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const img = document.createElement("img");
                    img.src = url;
                    img.width = opts.width;
                    img.height = opts.height;
                    placeholder.appendChild(img);
                    resolve(img);
                });
                return;
            }

            // Último recurso: usar qrcode library global 'QRCode' constructor (davidshimjs/qrcodejs)
            if (typeof window.QRCode === "function") {
                // davidshimjs/qrcodejs usa new QRCode(element, options)
                const span = document.createElement("div");
                placeholder.appendChild(span);
                new window.QRCode(span, {
                    text: link,
                    width: opts.width,
                    height: opts.height,
                    colorDark: opts.colorDark,
                    colorLight: opts.colorLight,
                    correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : undefined,
                });
                resolve(span);
                return;
            }

            reject(new Error("No se encontró una API compatible para generar el QR"));
        });
    }

    // Auto-init: genera al cargar usando el atributo data-qr-link si existe
    document.addEventListener("DOMContentLoaded", () => {
        const els = getContainerElements(DEFAULT_CONTAINER_ID);
        if (!els || !els.container) return;
        const link = els.container.getAttribute("data-qr-link");
        if (link) {
            generateQRCode(link).catch((err) => {
                // No interrumpir la app si falla; log para debugging
                console.error("QR generation failed:", err);
            });
        }
    });

    // Export a window-level helper para uso manual
    window.generateQRCode = generateQRCode;
})();