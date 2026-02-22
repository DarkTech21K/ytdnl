const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// NIEUW: Vertel de server om je HTML/CSS/JS bestanden te serveren
app.use(express.static(path.join(__dirname, ''))); 

// De homepage route (lost "Cannot GET /" op)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Je bestaande download route
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('Geen URL opgegeven');

    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        await ytpb(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: '-',
        }, { stdio: ['ignore', 'pipe', 'ignore'] })
        .then(output => {
            output.stdout.pipe(res);
        });
    } catch (error) {
        res.status(500).send('Er ging iets mis.');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));

