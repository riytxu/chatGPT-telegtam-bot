FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm i
COPY . ./
CMD [ "node", "index.js" ]