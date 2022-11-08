FROM golang:1.19.3-alpine3.16 as golang-builder

WORKDIR /go/dev

COPY . .

RUN go mod download && \
    go build -o ./app/cmd/main &&\
    go install github.com/cosmtrek/air@latest &&\
    go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

EXPOSE 5200
  
CMD ["air"]
