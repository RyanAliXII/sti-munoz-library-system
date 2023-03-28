FROM node:19-alpine3.16


WORKDIR /node/dev/admin

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5201

CMD ["npm","run","dev"]