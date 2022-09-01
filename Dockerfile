FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3009
CMD ["node", "index.js"]
