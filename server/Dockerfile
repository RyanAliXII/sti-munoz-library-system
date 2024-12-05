FROM golang:1.21.6-alpine3.18 as golang-builder

WORKDIR /go/dev

COPY . .

RUN apk add curl &&\
    curl -sSfL https://raw.githubusercontent.com/cosmtrek/air/master/install.sh | sh -s -- -b $(go env GOPATH)/bin && \
    air -v &&\
    wget -q https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.tar.gz && \
    tar -xf migrate.linux-amd64.tar.gz  && \
    mv migrate /usr/local/bin/migrate &&\
    rm migrate.linux-amd64.tar.gz && \
    go mod download && \
    go build -o app/bin/main app/cmd/main.go &&\
    apk add chromium &&\
    apk update --no-cache

EXPOSE 5200

CMD ["air"]
