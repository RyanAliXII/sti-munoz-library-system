FROM node:19-alpine3.16


WORKDIR /node/dev

COPY . .

RUN npm install

EXPOSE 5201
  
CMD ["npm","run","dev"]