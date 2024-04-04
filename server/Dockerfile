FROM golang:1.21.8-alpine3.18 as golang-builder

WORKDIR /go/dev

COPY . .

RUN go mod download && \
    go build -o app/bin/main app/cmd/main.go &&\
    go install github.com/cosmtrek/air@latest &&\ 
    apk add chromium &&\
    go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

EXPOSE 5200

CMD ["air"]
