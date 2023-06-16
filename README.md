# A Library System for STI College Munoz Edsa

## Requirements

- WSL 2.0
- Node JS installed in WSL
- Go Programming Language installed in WSL
- Docker Desktop

## Setting Up The Project

Clone the project

```bash
  git clone https://github.com/RyanAliXII/sti-munoz-library-system.git
```

Create .env file and copy the contents of .env.sample and replace values.

```bash
   touch .env
```

### First Time Setting Up For Development

If you notice red highlights and encounter the error message **"module cannot be found"** in your text editor, it is recommended to execute the command `npm install` in both the **client_app** and **admin_app** directories. This is necessary because the container for both **client_app** and **admin_app** relies on its own set of **node_modules**. The **node_modules** within the container are not directly connected or accessible in your local development file system. This separation ensures that the installed packages are compatible with your specific operating system.

```bash
   cd admin_app
```

```bash
   npm install
```

```bash
   cd client_app
```

```bash
   npm install
```

### Installing New Package

With this separation, You are required to install both on **local file system node_modules** and **container node_modules** when installing new package.

For example, you are installing **uuid** package from NPM

1.  Go to **admin_app** or **client_app** directory, then run `npm install uuid`
2.  SSH to container run the following command: `docker exec -it <container-name> /bin/sh`.

```bash
   docker exec -it admin_app /bin/sh
```

3. Then run `npm install uuid`, once you are inside the container.

## Running The Application

Go to project root directory and run one of the following:

### Run Development

```bash
    docker compose up -d
```

### Run Production

```bash
    docker compose -f production.yaml up -d
```

## Running Development Setup with Windows

To enable hot reload, it is recommended to have the project files on a Unix-like file system. In the case of using Windows Subsystem for Linux (WSL), the chosen Linux distribution's file system drive should be virtually mounted as one of your drives, allowing the project files to be placed there. The reason why hot reload may not work on Windows file systems is not entirely clear, but there are several relevant issues related to this topic that have been reported on the GitHub WSL repository.

- https://github.com/microsoft/WSL/issues/6255 - React hot reload not working for changes made in index.js
- https://github.com/microsoft/WSL/issues/6255 - File changes made by Windows apps on Windows filesystem don't trigger notifications for Linux apps
