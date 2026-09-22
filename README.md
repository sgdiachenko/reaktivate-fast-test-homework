# Reaktivate Fast-Test Homework

## Assignment

[Fast-Test Homework specification](https://docs.google.com/document/d/1_P0OMeYnKpbyn46N-wiB3JURMiAwbt4Ap9-rgapc1-g/edit?pli=1&tab=t.0)

## Implemented

- Books are loaded from the Reaktivate API.
- A hardcoded book can be created with the **Add** button.
- The list can be switched between all books and private books.
- A sticky application-wide header shows the current private-books count.
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

## Design decisions

### Caching

A dedicated caching layer is intentionally not included. The application and
its data set are small, while cache invalidation after book creation would add
complexity unrelated to the task. The controller keeps only the observable
state required by the UI and reloads server data after a successful mutation.

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
`https://tdd.demo.reaktivate.com/v1/books/sdiachenko` in the browser and allow
the certificate.

## Tests

```bash
npm run test:ci
```

To verify the production build:

```bash
npm run build
```
