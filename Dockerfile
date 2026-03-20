FROM node:18
RUN apt-get update && apt-get install -y ffmpeg python3
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]