document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("youtubeUrl");
    const downloadBtn = document.getElementById("downloadBtn");
    const statusRegion = document.getElementById("statusRegion");
    const statusMessage = document.getElementById("statusMessage");

    // PAS DIT AAN naar jouw Render URL
    const BACKEND_URL = "https://ytdnl-1.onrender.com/download";

    // Functie om de statusbalk bij te werken (Toegankelijkheid: aria-live staat in HTML)
    function updateStatus(text, type = "normal") {
        statusRegion.classList.remove("hidden");
        statusRegion.className = "status-box"; // Reset classes
        
        if (type === "error") {
            statusRegion.style.borderColor = "var(--error-color)";
            statusMessage.style.color = "var(--error-color)";
        } else if (type === "success") {
            statusRegion.style.borderColor = "var(--success-color)";
            statusMessage.style.color = "var(--success-color)";
        } else {
            statusRegion.style.borderColor = "var(--input-border)";
            statusMessage.style.color = "var(--text-color)";
        }

        statusMessage.textContent = text;
    }

    downloadBtn.addEventListener("click", async () => {
        const url = urlInput.value.trim();

        // 1. Controleer invoer
        if (!url) {
            updateStatus("Fout: Plak eerst een YouTube link.", "error");
            urlInput.focus();
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            updateStatus("Fout: Dit is geen geldige YouTube link.", "error");
            urlInput.focus();
            return;
        }

        // 2. Start proces: Knoppen blokkeren voor rustig beeld
        urlInput.disabled = true;
        downloadBtn.disabled = true;
        updateStatus("Bezig met voorbereiden van 320kbps MP3... Een moment geduld.", "normal");

        try {
            // 3. Verbinding maken met de server
            // We voegen een timeout toe voor het geval de gratis Render server nog moet opstarten
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minuten timeout voor grote video's

            const response = await fetch(`${BACKEND_URL}?url=${encodeURIComponent(url)}`, {
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Server reageert niet");
            }

            updateStatus("Server gevonden! De audio wordt nu gegenereerd...", "normal");

            // 4. Bestand downloaden als Blob (binair)
            const blob = await response.blob();
            if (blob.size === 0) throw new Error("Het gedownloade bestand is leeg.");

            const downloadUrl = window.URL.createObjectURL(blob);

            // 5. De eigenlijke download starten in de browser
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = downloadUrl;
            a.download = "audio-320kbps.mp3"; // Standaardnaam
            document.body.appendChild(a);
            a.click();
            
            // Opruimen
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();

            updateStatus("Klaar! De MP3 is opgeslagen op je apparaat.", "success");
            urlInput.value = ""; // Klaarzetten voor de volgende link

        } catch (error) {
            console.error("Download fout:", error);
            if (error.name === 'AbortError') {
                updateStatus("Fout: De server deed er te lang over. Probeer het nog eens.", "error");
            } else {
                updateStatus(`Fout: ${error.message}`, "error");
            }
        } finally {
            // 6. Invoer weer aanzetten
            urlInput.disabled = false;
            downloadBtn.disabled = false;
            urlInput.focus();
        }
    });

    // Enter toets ondersteuning
    urlInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !downloadBtn.disabled) {
            downloadBtn.click();
        }
    });
});
