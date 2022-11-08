# SLiM App

#### A Library Management System for STI College Munoz Edsa
## Requirements
* WSL 2.0 
* Node JS installed in WSL
* Go Programming Language installed in WSL
* Docker Desktop
## Run Locally with Docker

Clone the project

```bash
  git clone https://github.com/RyanAliXII/SLiM-App.git
```

Go to the project directory

```bash
  cd slim-app
```

Build containers 

```bash

    docker build -t sti-munoz/slim-spa-admin ./spa-admin
   
    docker build -t sti-munoz/slim-spa-client ./spa-client

    docker build -t sti-munoz/slim-server ./server

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
  git clone https://github.com/RyanAliXII/SLiM-App.git
```

Go to the project directory

```bash
  cd my-project
```

Go to each services folder

```bash
    in spa-admin folder run :   npm run dev
    in spa-client folder run :   npm run dev
    in server folder: go run main.go

```


