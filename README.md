# Reaktivate Fast-Test Homework

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
