FROM node:12.14.1-alpine

# Create app directory
WORKDIR /usr/src/app

COPY src ./src
COPY package*.json ./
RUN npm install
RUN ls
RUN mkdir keys

EXPOSE 8080
CMD [ "npm", "start" ]