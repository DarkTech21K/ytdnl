document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("youtubeUrl");
    const downloadBtn = document.getElementById("downloadBtn");
    const statusRegion = document.getElementById("statusRegion");
    const statusMessage = document.getElementById("statusMessage");

    // Replace this with your actual backend URL when hosting
    // e.g., const BACKEND_URL = "https://your-server.com/download";
    const BACKEND_URL = "https://ytdnl-1.onrender.com";

    function updateStatus(text, type = "normal") {
        statusRegion.classList.remove("hidden");
        statusRegion.className = "status-box"; // Reset classes
        if (type === "error") statusRegion.classList.add("error");
        else if (type === "success") statusRegion.classList.add("success");

        statusMessage.textContent = text;
    }

    downloadBtn.addEventListener("click", async () => {
        const url = urlInput.value.trim();

        if (!url) {
            updateStatus("Please enter a YouTube link first.", "error");
            urlInput.focus();
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            updateStatus("That does not look like a valid YouTube link.", "error");
            urlInput.focus();
            return;
        }

        // Start processing
        urlInput.disabled = true;
        downloadBtn.disabled = true;
        updateStatus("Downloading and converting... Please wait, this might take a few minutes.", "normal");

        try {
            // Initiate the conversion request
            const response = await fetch(`${BACKEND_URL}?url=${encodeURIComponent(url)}`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to download.");
            }

            // Trigger the file download in the browser
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            // Try to get filename from headers, otherwise use default
            let filename = "audio.mp3";
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const a = document.createElement("a");
            a.style.display = "none";
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();

            updateStatus("Download Complete! You can now check your files.", "success");
            urlInput.value = ""; // Clear for next use
        } catch (error) {
            console.error("Download error:", error);
            updateStatus(`Error: ${error.message}. Please try again later.`, "error");
        } finally {
            // Re-enable inputs
            urlInput.disabled = false;
            downloadBtn.disabled = false;
            urlInput.focus();
        }
    });

    // Allow Enter key to submit
    urlInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            downloadBtn.click();
        }
    });
});


