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
  cd my-project
```

Build containers 

```bash
    cd spa
    docker build -t slim-spa . 
    cd .. 
    cd server 
    docker build -t slim-server . 

```

 Go to project root directory and run

```bash
    
    docker compose up
```
## Run Locally without docker

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
    cd spa
    npm run dev. 
    cd .. 
    cd server 
    go run main.go

```


