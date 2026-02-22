FROM node:18

# Installeer FFmpeg en Python3
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Maak een snelkoppeling van python3 naar python (lost de npm error op)
RUN ln -s /usr/bin/python3 /usr/bin/python

# Installeer yt-dlp handmatig
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Kopieer bestanden
COPY package*.json ./
RUN npm install

COPY . .

RUN yt-dlp -U
EXPOSE 5000
CMD ["node", "server.js"]

