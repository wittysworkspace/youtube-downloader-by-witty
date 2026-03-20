# ใช้ Node.js เวอร์ชัน 20 แทน 18
FROM node:20-bookworm

# ติดตั้ง ffmpeg และ python3 สำหรับการรวมไฟล์
RUN apt-get update && apt-get install -y ffmpeg python3

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]