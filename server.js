const express = require('express');
const cors = require('cors');
const ytpb = require('yt-dlp-exec');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// De route die je app aanroept
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Geen URL opgegeven');
    }

    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        
        // We streamen de audio direct naar de gebruiker
        await ytpb(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: '-',
        }, { stdio: ['ignore', 'pipe', 'ignore'] })
        .then(output => {
            output.stdout.pipe(res);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Er ging iets mis bij het omzetten.');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));