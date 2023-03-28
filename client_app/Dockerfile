FROM node:19-alpine3.16


WORKDIR /node/dev/client

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5202
  
CMD ["npm","run","dev"]