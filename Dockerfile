# Gebruik een versie van Linux waar alles al op zit
FROM node:18

# Installeer FFmpeg en Python (nodig voor yt-dlp)
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Installeer yt-dlp direct in de container
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Zet de werkmap in de container
WORKDIR /app

# Kopieer je package.json en installeer je Node-pakketten
COPY package*.json ./
RUN npm install

# Kopieer de rest van je code
COPY . .

# Start de server
EXPOSE 5000
CMD ["node", "server.js"]