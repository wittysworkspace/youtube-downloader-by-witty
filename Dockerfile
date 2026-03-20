FROM node:20-bookworm

# ติดตั้งโปรแกรมที่จำเป็นและโหลด yt-dlp เวอร์ชันล่าสุด
RUN apt-get update && apt-get install -y ffmpeg python3 curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]