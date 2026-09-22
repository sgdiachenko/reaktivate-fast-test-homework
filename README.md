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

### Stale response protection

Overlapping requests can finish out of order. For example, a slow All-books
response may arrive after the user has switched to Private books. Applying it
would display the wrong list for the selected mode.

The controller uses two request counters: `listRequestId` for the visible list
and `countRequestId` for the header count. Each request captures its counter
value before awaiting the API and applies its result only if that value is
still current. These bookkeeping fields are excluded from MobX observation.

The counters are independent because a Private-books response can update both
the list and the count. Switching to All makes its list result obsolete, but
its count can still be useful if no newer count request has started. Conversely,
a count-only refresh should not invalidate a pending list request.

This protects state correctness; it does not cache data or cancel HTTP requests.
Unit tests resolve requests out of order to verify switching, repeated loads,
and counter refreshes after book creation.

### Caching

A dedicated caching layer is intentionally not included. The application and
its data set are small, while cache invalidation after book creation would add
complexity unrelated to the task. The controller keeps only the observable
state required by the UI and reloads server data after a successful mutation.

### Request failures and retries

The gateway rejects unsuccessful HTTP responses before parsing JSON. The
controller catches failures and logs diagnostics with `console.debug` (enable
Verbose messages in browser DevTools to see them). No error messages are shown
on screen. Stale failures are ignored using the request counters.

Switching modes clears the previous list so All books cannot remain visible
under Private after a failed request. The selected mode button stays disabled;
switch away and back, or reload the page, to retry. The header displays `—`
initially and after a failed count request; a successful empty response displays
`0`. This display-ready field needs no additional computed getter.

Add is disabled during creation and its refresh. A failed refresh after a
successful POST is logged as a loading failure. Creation is never retried
automatically: a lost response does not prove that the server did not create
the book. Check the refreshed list before manually attempting creation again.

### Possible improvements

- Loading indicators to distinguish pending requests from an empty list.
- User-visible error messages with explicit retry actions, so failures can be
  understood and recovered from without opening the developer console.

These UX enhancements are intentionally left out to keep the homework focused
on separating testable logic from rendering.

## Requirements

- Node.js 24.15.0 (the version used to verify this project; see `.nvmrc`)
- npm

The starter uses Create React App 3. The npm scripts include the OpenSSL
compatibility option required by its older webpack version on modern Node.js.
The start/build commands use POSIX environment-variable syntax (macOS/Linux;
use WSL on Windows). The original dependencies have not been upgraded and npm
reports known vulnerabilities; this starter should not be treated as a
production-ready dependency baseline.

## Run locally

```bash
nvm install
nvm use
npm ci --legacy-peer-deps
npm start
```

The application opens at `http://localhost:3000`.

The API uses a self-signed SSL certificate. Before using the application, open
`https://tdd.demo.reaktivate.com/v1/books/sdiachenko` in the browser and allow
the certificate.

## Tests

Tests cover controller behavior, out-of-order responses, request failures,
and HTTP gateway status handling without real network requests.

```bash
npm run test:ci
```

To verify the production build:

```bash
npm run build
```
