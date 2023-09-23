FROM node:19-alpine3.16


WORKDIR /node/dev/scanner

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5209
  
CMD ["npm","run","dev"]