# Herda

**Keep on top of it all with Herda** :cow2:

## Requirements

- [Node.js](https://nodejs.org/en/download/) v20
- [Docker Desktop](https://docs.docker.com/desktop/) or [Docker Engine](https://docs.docker.com/engine/) (your preference)

If you prefer not to use Docker, you can set up [MongoDB Community Server](https://www.mongodb.com/try/download/community) v7 manually. This documentation targets a Docker-based workflow and you will need to make any adjustments yourself.

> :warning: This software is untested with other versions of MongoDB!

If you are planning to develop Herda, it is recommended to use [nvm](https://github.com/nvm-sh/nvm) to help ensure you are running the correct version of Node.

## Development quickstart

Getting started developing Herda is simple, as both apps use development-friendly default configuration, with one exception: you are advised to set a static [JWT](https://jwt.io/) secret. (If you don't, one will be generated randomly when the server starts up that can be used for a demo, but it won't persist through a restart.)

Run the following snippet to generate a static secret:

```sh
echo 'console.log(require("crypto").randomBytes(64).toString("hex"))' |\
  node - |\
  xargs -I{} echo "AUTH_JWT_SECRET={}" >> .env
```

You are now ready to start up services. First, start MongoDB:

```sh
docker compose up -d
```

After MongoDB has started and initialized, install and start the server:

```sh
# Install dependencies
npm install
# Start the server app
npm run dev
```

Open <http://localhost:5001/api> in your browser. If you receive a JSON response including "Herda Server" and a version number, then it's up and running.

To run the PWA, open a separate terminal in the [web](./web) directory and run similar setup commands:

```sh
# Install dependencies
npm install
# Start the PWA
npm run dev
```

Open the URL shown in the terminal - most likely <http://localhost:5173>. If you see a login page, and the version number you saw in the API response earlier is displayed in the bottom left corner, then everything is connected up and you're all set.

> :information_source: Both the server and PWA reload automatically when their source code is changed, so there's no need to manually stop and restart them unless you change a dependency.

When you are finished working on Herda and want to teardown the work environment, exit the npm processes (Ctrl-C or Cmd-C) and run `docker compose stop` to exit MongoDB.

## Docker quickstart

An alternative approach to running Herda is to build a Docker image which runs both the headless API and frontend statically. This is primarily intended for production use. The [Dockerfile](./Dockerfile) handles building the app into a distributable image, and you just need to configure its environment.

An additional [Compose file](./docker-compose.herda.yml) is provided to help test the Docker image locally. You will need to set up a static JWT secret and the MongoDB connection string. Run the following to get going:

```sh
# Generate static JWT secret
echo 'console.log(require("crypto").randomBytes(64).toString("hex"))' |\
  node - |\
  xargs -I{} echo "AUTH_JWT_SECRET={}" >> .docker.env
# Set MongoDB connection string
echo 'MONGO_URI=mongodb://root:root@mongo:27017' >> .docker.env
```

Once .docker.env is in place, run the following command to automatically build and start services:

```sh
docker compose -f docker-compose.herda.yml -f docker-compose.yml up -d
```

After Docker finishes this process, open <http://localhost:5001> in your browser. You should see a login page with the app version in the bottom left corner.

When you are finished testing Herda and want to teardown the test environment, run the opposite command to stop services:

```sh
docker compose -f docker-compose.herda.yml -f docker-compose.yml stop
```

> :information_source: All Docker Compose actions, including rebuilding the Herda image, should continue to use both Compose files. They are automatically merged by Docker to create a complete environment.

## Configuration

Both the server app and PWA are configured using environment variables. These can be set in .env and web/.env respectively.

For complete configuration references, refer to:

- Server: usage of `process.env.*` in [src/index.ts](./src/index.ts)
- PWA: usage of `import.meta.env.VITE_*` in [web/src/build.ts](./web/src/build.ts)

> :information_source: In development, both apps load configuration at startup (and in the case of the PWA, configuration is also hot reloaded).
>
> When they are built, such as to a [Docker image](./Dockerfile), this becomes slightly different. The server app still loads configuration at startup, but the PWA is configured at build time and cannot be reconfigured afterwards.
>
> Accordingly, when building the PWA or Docker image, ensure the PWA is correctly configured as it cannot be changed afterwards.

## Project structure

> :information_source: This section provides more detail for contributors interested in the internal workings of the Herda apps. If you do not need that much detail, you can safely stop reading here.

Herda, as a project, comes in three parts:

- MongoDB database
- Headless server app
- Progressive web app

The PWA connects to the server, which in turn connects to the database.

The server app is built in Node.js with TypeScript and has minimal dependencies. Its root directory is the repository root, and most of its source code is located in [src](./src). Its 'global' code is located there, and subdirectories represent modules following a conventional structure. This section mostly focuses on how the server code is organised.

The PWA is built in React with TypeScript and uses [Vite](https://vitejs.dev/) for development and build tooling. Its root directory is [web](./web) and most of its source code is located in the corresponding [src](./web/src) directory. Unlike the server app, this does not use a strong modular structure owing to its comparative simplicity. This may change in the future with expansion of scope.

### Context object

The server app builds a 'context object' in its main function and then passes this down (usually by reference) to other code locations while constructing the app. This supports and encourages a functional, often stateless approach to adding new code. Where there _is_ state, this is usually in the form of currying, where a new function is built using context objects or data.

The full context type is summarised in [src/types.ts](./src/types.ts).

### Logging

The server includes a simple logger which can be configured to provide more or less detail, depending on your needs. For development you may want to use `debug` or even `trace` level, whereas in production you most likely only need to see `warn` and `error` messages.

The logger context is put together in [src/log.ts](./src/log.ts).

### Database management

The server connects to MongoDB using the standard [MongoClient](https://www.npmjs.com/package/mongodb). Data management proper typically goes through [models](https://en.wikipedia.org/wiki/Database_model) that provide database initialization, common procedures, and where appropriate direct access to MongoDB collections.

Each module includes a model.ts file encapsulating relevant database functionality. For example, [src/account/model.ts](./src/account/model.ts) includes functions for creating and updating accounts with expanded support for password changes, amongst others.

The database context is created in [src/db.ts](./src/db.ts).

### API

Each module includes an api.ts file which exports functions reflecting REST procedures. For example, [src/account/api.ts](./src/account/api.ts) describes APIs for managing and accessing accounts.

The headless (RESTful) API is put together in [src/http.ts](./src/http.ts).

On the client side, the best reference for the headless server API is in the API client library. This is maintained as part of the PWA in [web/src/api](./web/src/api).

### Authentication

Authentication uses JSON Web Tokens (JWT). This is expressed within the server as an authentication context in [src/auth.ts](./src/auth.ts), which is mainly used by API middleware and some account APIs.

Refer to the [API client library](#api) for client-side usage. In terms of the PWA proper, authentication is managed via the [useSession](./web/src/hooks/index.ts) hook (using [SessionContext](./web/src/providers/session.ts)) and verified by the [Authenticated](./web/src/components/Authenticated.tsx) component.

## License

See [LICENSE.md](./LICENSE.md)
