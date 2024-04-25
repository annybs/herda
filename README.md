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
docker compose up mongo -d
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

When you are finished working on Herda and want to teardown the work environment, exit the npm processes (Ctrl-C or Cmd-C) and run `docker compose stop mongo` to exit MongoDB.

## Docker quickstart

An alternative approach to running Herda is to build a Docker image which runs both the headless API and frontend statically. This is primarily intended for production use. The [Dockerfile](./Dockerfile) handles building the app into a distributable image, and you just need to configure its environment.

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
docker compose build
docker compose up -d
```

After Docker finishes this process, open <http://localhost:5001> in your browser. You should see a login page with the app version in the bottom left corner.

When you are finished testing Herda and want to teardown the test environment, run the stop command to stop services:

```sh
docker compose stop
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

## Further reading

- [Design & Architecture](./DESIGN.md)

## License

See [LICENSE.md](./LICENSE.md)
