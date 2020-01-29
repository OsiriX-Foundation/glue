FROM node:12.14.1-alpine

# Create app directory
WORKDIR /usr/src/app

COPY src ./src
COPY package*.json ./
COPY .babelrc ./
RUN npm install --save
RUN npm run build

EXPOSE 80
CMD [ "npm", "run", "serve" ]