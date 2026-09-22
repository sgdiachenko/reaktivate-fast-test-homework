# Reaktivate Fast-Test Homework

## Implemented

- Books are loaded from the Reaktivate API.
- A hardcoded book can be created with the **Add** button.
- Application state and behavior are handled by a MobX controller.
- React views are functional, observable, and limited to rendering and
  forwarding user actions.
- Controller behavior is covered by fast unit tests with a fake repository.

## Architecture

```text
View -> Controller -> Repository -> API gateway
```

`BooksController` owns the observable state and application behavior. Its
repository dependency is provided through the constructor, which allows the
controller to be tested without React, DOM rendering, or HTTP requests.

## Requirements

- Node.js 16 (recommended for the original Create React App 3 toolchain)
- npm

The starter uses Create React App 3. The npm scripts include the OpenSSL
compatibility option required by its older webpack version on modern Node.js.

## Run locally

```bash
nvm use
npm ci --legacy-peer-deps
npm start
```

The application opens at `http://localhost:3000`.

The API uses a self-signed SSL certificate. Before using the application, open
`https://tdd.demo.reaktivate.com/v1/books/postnikov` in the browser and allow
the certificate.

## Tests

```bash
npm run test:ci
```

To verify the production build:

```bash
npm run build
```
