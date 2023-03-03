# A Library System for STI College Munoz Edsa

## Requirements

- WSL 2.0
- Node JS installed in WSL
- Go Programming Language installed in WSL
- Docker Desktop

## Run Locally with Docker

Clone the project

```bash
  git clone https://github.com/RyanAliXII/STI-Munoz-Library-System.git
```

Build containers

```bash

    docker build -t sti-munoz-library/admin  ./admin_app

    docker build -t sti-munoz-library/client ./client_app

    docker build -t sti-munoz-library/server ./server

```

Create .env file and copy the contents of .env.sample. Add values.

```bash

   touch .env
```

Go to project root directory and run

```bash

    docker compose up
```

## Run Locally without Docker

Clone the project

```bash
  git clone https://github.com/RyanAliXII/STI-Munoz-Library-System.git
```

Go to the project directory

```bash
  cd my-project
```

Go to each services folder

```bash
    in admin_app folder run :   npm run dev
    in client_app folder run :   npm run dev
    in server folder: go run main.go

```
