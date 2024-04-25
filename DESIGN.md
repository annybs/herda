# Design & Architecture

> :information_source: This section provides more detail if you are interested in the internal workings of the Herda apps. If you do not need that much detail, [head back to the README](./README.md).

Herda, as a project, comes in three parts:

- MongoDB database
- Headless server app
- Progressive web app

The PWA connects to the server, which in turn connects to the database.

The server app is built in Node.js with TypeScript and has minimal dependencies. Its root directory is the repository root, and most of its source code is located in [src](./src). Its 'global' code is located there, and subdirectories represent modules following a conventional structure. This section mostly focuses on how the server code is organised.

The PWA is built in React with TypeScript and uses [Vite](https://vitejs.dev/) for development and build tooling. Its root directory is [web](./web) and most of its source code is located in the corresponding [src](./web/src) directory. Unlike the server app, this does not use a strong modular structure owing to its comparative simplicity. This may change in the future with expansion of scope.

## Context object

The server app builds a 'context object' in its main function and then passes this down (usually by reference) to other code locations while constructing the app. This supports and encourages a functional, often stateless approach to adding new code. Where there _is_ state, this is usually in the form of currying, where a new function is built using context objects or data.

The full context type is summarised in [src/types.ts](./src/types.ts).

## Logging

The server includes a simple logger which can be configured to provide more or less detail, depending on your needs. For development you may want to use `debug` or even `trace` level, whereas in production you most likely only need to see `warn` and `error` messages.

The logger context is put together in [src/log.ts](./src/log.ts).

## Database management

The server connects to MongoDB using the standard [MongoClient](https://www.npmjs.com/package/mongodb). Data management proper typically goes through [models](https://en.wikipedia.org/wiki/Database_model) that provide database initialization, common procedures, and where appropriate direct access to MongoDB collections.

Each module includes a model.ts file encapsulating relevant database functionality. For example, [src/account/model.ts](./src/account/model.ts) includes functions for creating and updating accounts with expanded support for password changes, amongst others.

The database context is created in [src/db.ts](./src/db.ts).

## API

Each module includes an api.ts file which exports functions reflecting REST procedures. For example, [src/account/api.ts](./src/account/api.ts) describes APIs for managing and accessing accounts.

The headless (RESTful) API is put together in [src/http.ts](./src/http.ts).

On the client side, the best reference for the headless server API is in the API client library. This is maintained as part of the PWA in [web/src/api](./web/src/api).

## Authentication

Authentication uses JSON Web Tokens (JWT). This is expressed within the server as an authentication context in [src/auth.ts](./src/auth.ts), which is mainly used by API middleware and some account APIs.

Refer to the [API client library](#api) for client-side usage. In terms of the PWA proper, authentication is managed via the [useSession](./web/src/hooks/index.ts) hook (using [SessionContext](./web/src/providers/session.ts)) and verified by the [Authenticated](./web/src/components/Authenticated.tsx) component.

